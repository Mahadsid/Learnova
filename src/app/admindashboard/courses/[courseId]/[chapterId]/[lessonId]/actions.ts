"use server";

import { requireAdmin } from "@/app/dataAcclyr/admin/require-admin";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { lessonSchema, LessonSchemaType } from "@/lib/ZodSchema";

//server action for updating lessons in DB
export async function updateLesson(values: LessonSchemaType, lessonId: string, ): Promise<ApiResponse> {
    //only admin can make that call
    await requireAdmin()

    try {
        //getting values from the form and parsing it against our lesson schmea
        const result = lessonSchema.safeParse(values);
        //defnesecode
        if (!result.success) {
            return {
                status: "error",
                message: "Invalid data",
            }
        }

        //here we get correct data
        await prisma.lesson.update({
            where: {
                id: lessonId,
            },
            data: {
                title: result.data.name,
                description: result.data.description,
                thumbnailKey: result.data.thumbnailKey,
                videoKey: result.data.videoKey,
            },
        });

        return {
            status: "success",
            message: "Lesson updated/uploaded successfully."
        }
        
    } catch  {
        return {
            status: "error",
            message: "Failed to update/upload lesson.",
        }
    }
}