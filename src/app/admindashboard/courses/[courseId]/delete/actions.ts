"use server";

import { requireAdmin } from "@/app/dataAcclyr/admin/require-admin";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { request } from "@arcjet/next";
import { revalidatePath } from "next/cache";

// securing api with arcjet, configurating it
const aj = arcjet
    // detectBot({
    //     mode: "LIVE",
    //     allow: [],
    // }) we-commented or can delete this bcz we implemented detectbot in middleware so it intercept bot at every request no need to deifne it here again! read docs to read docs see middleware.ts file more info there.
.withRule(
    fixedWindow({
        mode: "LIVE",
        window: "1m",
        max: 5,
    })
);


export async function DeleteCourse(courseId: string): Promise<ApiResponse> {
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

    try {

        await prisma.course.delete({
            where: {
                id: courseId,
            },
        });

        revalidatePath("/admindashboard/courses");

        return {
            status: "success",
            message: "Course deleted successfully."
        }
    } catch {
        return {
            status: "error",
            message: "Failed to delete course."
        }
    }
}