"use server";

import { requireAdmin } from "@/app/dataAcclyr/admin/require-admin";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { ApiResponse } from "@/lib/types";
import { courseSchema, CourseSchemaType } from "@/lib/ZodSchema";
import { request } from "@arcjet/next";


// securing api with arcjet, configurating it
const aj = arcjet
//     .withRule(
//     detectBot({
//         mode: "LIVE",
//         allow: [],
//     })
// ) we-commented or can delete this bcz we implemented detectbot in middleware so it intercept bot at every request no need to deifne it here again! read docs to read docs see middleware.ts file more info there.
    .withRule(
    fixedWindow({
        mode: "LIVE",
        window: "1m",
        max: 5,
    })
);


//this is server action: read more about it!
export async function CreateCourse(values: CourseSchemaType) : Promise<ApiResponse> {
    try {
        
        //getting session bcz we need to set userId when filling course database, bcz it is linked with user table otherwise it give foreign key constraint error.
        // const session = await auth.api.getSession({
        //     headers: await headers(),
        // }) THIS IS COMMENTED BCZ: since we make general file for checking session plus checking for user | admin we use new code below and commented this!
        const session = await requireAdmin();


        //since in server action we dont get request so arcjet solve this problem by giving us request() check its nextjs sdk docs for server action (https://docs.arcjet.com/reference/nextjs/)
        // Access the request object so Arcjet can analyze it from arcjet/next!
        const req = await request();

        // arcjet protection : passing the request to arcjet
        //firstly arcjet validate the request then only we move forward with the below code, this require two things first the request 2. is something unique to track the request (remember fingerprint waht we added in lib/arcjet.ts)! so for this uniuqe we are going to use session id!
        const decision = await aj.protect(req, { fingerprint: session?.user.id as string })
        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                return {
                    status: "error",
                    message: "You have been denied due to rate limiting",
                };
            } else {
                return {
                    status: "error",
                    message: "Don't fuzz my api!"
                };
            }
        }





        //form side validation siliar like making route or api. //this is like a "server side" validation without creating a rote but through server actions!
        // 1. taking data from params., parsing it against the schema for validation 
        const validation = courseSchema.safeParse(values);
        //2. defence code
        if (!validation.success) {
            return {
                status: "error",
                message: "Invalid form data",
            };
        }

        //creting productId for each course to save in in DB so that which course is bought we know that, check course stripeProductId for each course in is a field in Course table.
        const data = await stripe.products.create({
            name: validation.data.title,
            description: validation.data.smallDescription,
            default_price_data: {
                currency: 'eur',
                unit_amount: validation.data.price * 100,
            }

        });

        await prisma.course.create({
            data: {
                ...validation.data,
                userId: session?.user.id as string,
                stripePriceId: data.default_price as string,
            },
        });
        
        return {
            status: 'success',
            message: "Course created successfully"
        }

    } catch  {
        return {
            status: "error",
            message: "Failed to create course."
        }
    }
}