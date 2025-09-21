"use server";

import { requireUser } from "@/app/dataAcclyr/user/require-user";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { ApiResponse } from "@/lib/types";
import { request } from "@arcjet/next";
import { redirect } from "next/navigation";
import Stripe from "stripe";

const aj = arcjet.withRule(
    fixedWindow({
        mode: 'LIVE',
        window: '1m',
        max: 5,
    })
);

//to get enroll in the course we need its specific id to find that course in database!
export async function enrollInCourse( courseId: string): Promise<ApiResponse | never> {
    const user = await requireUser();
    let checkoutUrl: string;
    try {

        // AT LAST PROTECTING WITH ARCJET
        const req = await request()
        const decision = await aj.protect(req, {
            fingerprint: user.id,
        });
        if (decision.isDenied()) {
            return {
                status: 'error',
                message: 'You have been blocked. Due to rate limiting.'
            }
        }

        // step 1. find course,  
        const course = await prisma.course.findUnique({
            where: {
                id: courseId,
            },
            select: {
                id: true,
                title: true,
                price: true,
                slug: true,
                stripePriceId: true,
            },
        });
        //defese code
        if (!course) {
            return {
                status: "error",
                message: "Course not found."
            }
        }

        let stripeCustomerId: string;
        // step 2: verify if the user already have the stripe customer id,
        const userWithStripeCustomerId = await prisma.user.findUnique({
            where: {
                id: user.id,
            },
            select: {
                stripeCustomerId: true,
            },
        });
        // step 3. If user have stripe customerId this means user is already a customer and have customerId and we update it,,,, if we get null so this means user dont have a stripe customer id and we can create a customer and its customerId and update the user customerId.
        if (userWithStripeCustomerId?.stripeCustomerId) {
            stripeCustomerId = userWithStripeCustomerId.stripeCustomerId;
        } else {
            //create a new customer in stripe
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: {
                    userId: user.id,
                },
            });
            stripeCustomerId = customer.id;
            //update DB, updating the customerId;
            await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    stripeCustomerId: stripeCustomerId,
                },
            });
        }

        const result = await prisma.$transaction(async (tx) => {
            // checking if user already enrolled in course, bcz user cannot pay again for same course. for checking if user is already enrolled we check userId&courseId should match then we know yes this user is enrolled in that course but we dont have any thing to check that in DB so we create new field in Enrollment model @@unique([userIdm courseId]) to tell prisma/db that these two propetries are unique.
            const existingEnrollemnt = await tx.enrollment.findUnique({
                where: {
                    //check schema, we created new unique paramaeter to tell/show db these fields are unique.
                    userId_courseId: {
                        userId: user.id,
                        courseId: courseId,
                    },
                },
                select: {
                    status: true,
                    id: true,
                }
            });

            if (existingEnrollemnt?.status === 'Active') {
                return {
                    status: "success",
                    message: "You are already enrolled in this course."
                }
            }

            //checking if we have exixting enrollment, if the status is pending then we update the updatedAt timestamp, & if we dont have any exixting enrollment then we create a new one.
            let enrollment;
            if (existingEnrollemnt) { //have enrollment
                enrollment = await tx.enrollment.update({
                    where: {
                        id: existingEnrollemnt.id
                    },
                    data: {
                        amount: course.price,
                        status: 'Pending',
                        updatedAt: new Date(),
                    },
                });
            } else //dont have enrollment so cerate new  one.
            {
                enrollment = await tx.enrollment.create({
                    data: {
                        userId: user.id,
                        courseId: course.id,
                        amount: course.price,
                        status: "Pending",
                    },
                });
            }
            
            //creating stripe checkout session
            const checkoutSession = await stripe.checkout.sessions.create({
                // linking checkout session to our stripecustomer
                customer: stripeCustomerId,
                //line_items is a list of items customer is purchasing. Use this parameter to pass one-time or recurring Prices.
                line_items: [
                    {
                        price:course.stripePriceId,
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${env.BETTER_AUTH_URL}/payment/success`,
                cancel_url: `${env.BETTER_AUTH_URL}/payment/cancel`,
                metadata: {
                    userId: user.id,
                    courseId: course.id,
                    enrollmentId: enrollment.id,
                },
            });

            return {
                enrollment: enrollment,
                checkoutUrl: checkoutSession.url,
            };
        });

        checkoutUrl = result.checkoutUrl as string;
        
    } catch(error) {
        if (error instanceof Stripe.errors.StripeError) {
            return {
                status: "error",
                message: "Payment system error. Please try again later."
            }
        }
        return {
            status: "error",
            message: "Failed to enroll in course."
        }
    }
    redirect(checkoutUrl);
}