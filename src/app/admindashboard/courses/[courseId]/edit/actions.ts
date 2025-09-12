"use server";

import { requireAdmin } from "@/app/dataAcclyr/admin/require-admin";
import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { courseSchema, CourseSchemaType } from "@/lib/ZodSchema";
import { request } from "@arcjet/next";


// securing api with arcjet, configurating it
const aj = arcjet.withRule(
    detectBot({
        mode: "LIVE",
        allow: [],
    })
).withRule(
    fixedWindow({
        mode: "LIVE",
        window: "1m",
        max: 5,
    })
);

export async function editCourse(data: CourseSchemaType, courseId: string): Promise<ApiResponse> {


    // user should only be admin, bcz we give admin oly privilage to make course so only admin can edit course 
    const user = await requireAdmin();

    //since in server action we dont get request so arcjet solve this problem by giving us request() check its nextjs sdk docs for server action (https://docs.arcjet.com/reference/nextjs/)
    // Access the request object so Arcjet can analyze it from arcjet/next!
    const req = await request();

    // arcjet protection : passing the request to arcjet
    //firstly arcjet validate the request then only we move forward with the below code, this require two things first the request 2. is something unique to track the request (remember fingerprint waht we added in lib/arcjet.ts)! so for this uniuqe we are going to use session id!
    const decision = await aj.protect(req, { fingerprint: user.user.id as string })
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
        //doing server side validation, receiving data from the edit form and parsing it against our course schema for verfication!
        const result = courseSchema.safeParse(data);
        //defense code
        if (!result.success) {
            return {
                status: "error",
                message: "Invalid data"
            }
        }

        //now data recieved from edit form is good to use so can create a mutation in our course table and update the course! 
        await prisma.course.update({
            where: {
                id: courseId, // course id
                userId: user.user.id, // foregin key constraint so this is necessary to add. & user can create course so it matches and our user is admin!
            },
            data: {
                ...result.data, // we can update data field by field but this is easy just spread all the data recieved from edit form into the table updation field.
            },
        });
        return {
            status: "success",
            message: "Course updated successfully"
        }
    } catch  {
        return {
            status: "error",
            message: "Failed to update course."
        }
    }
}