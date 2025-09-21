import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import Stripe from "stripe";

//webhook for stripe. 
export async function POST(req: Request){
    const body = await req.text();

    const headersList = await headers();

    const signature = headersList.get("Stripe-Signature") as string;

    let event: Stripe.Event; 


    //constructing a webhook bcz we try to confirm the incoming request is atually from Stripe and from other source. 
    try { 
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            env.STRIPE_WEBHOOK_SECRET
        );
    } catch {
        return new Response("Webhook error", { status: 400 });
    }

    //getting session data from our event object
    const session = event.data.object as Stripe.Checkout.Session;
    //events we can listen to : here we are listening to completed event.
    if (event.type === 'checkout.session.completed') {
        //these courseId and userId/customerId we are getting here bcz we added them in metadata in actions file for enroll now.
        const courseId = session.metadata?.courseId;
        const customerId = session.customer as string;
        //since course can be null so defence code.
        if (!courseId) {
            throw new Error("Course id not found...");
        }
        //getting user where it matches. so we can update the DB properties like status to active since he purchases the course. 
        const user = await prisma.user.findUnique({
            where: {
                stripeCustomerId: customerId,
            },
        });
        //if no user defence code.
        if (!user) {
            throw new Error("User not found...")
        }
        //updating the DB.
        await prisma.enrollment.update({
            where: {
                id: session.metadata?.enrollmentId as string,
            },
            data: {
                userId: user.id,
                courseId: courseId,
                amount: session.amount_total as number,
                status: "Active",
            },
        });
    }
    return new Response(null, { status: 200 });
}