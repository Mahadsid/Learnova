"use server";

import { requireUser } from "@/app/dataAcclyr/user/require-user";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function markLessonComplete(lessonId: string, slug: string): Promise<ApiResponse> {
    const session = await requireUser();

    try {
        //upsert means if record does not exist we create one, if exsists we update it.
        await prisma.lessonProgress.upsert({
            where: {
                userId_lessonId: {
                    userId: session.id,
                    lessonId: lessonId,
                },
            },
            update: {
                completed: true,
            },
            create: {
                lessonId: lessonId,
                userId: session.id,
                completed: true,
            },
        });

        revalidatePath(`/dashboard/${slug}`);

        return {
            status: 'success',
            message: 'Progress updated.'
        }

    } catch {
        return {
            status: 'error',
            message: 'Failed to mark lesson as complete.'
        }
    }
}
