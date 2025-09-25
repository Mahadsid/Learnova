import "server-only";
import { requireUser } from "../user/require-user";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export async function getLessonContent(lessonId: string) {
    const session = await requireUser();

    const lesson = await prisma.lesson.findUnique({
        where: {
            id: lessonId
        },
        select: {
            id: true,
            title: true,
            description: true,
            thumbnailKey: true,
            videoKey: true,
            position: true,
            lessonProgress: {
                where: {
                    userId: session.id,
                },
                select: {
                    completed: true,
                    lessonId: true,
                },
            },
            Chapter: {
                select: {
                    courseId: true,
                    Course: {
                        select: {
                            slug: true,
                        }
                    }
                },
            },
        },
    });
    if (!lesson) {
        return notFound();
    }

    //Security check : check if user is enrolled or not, if user is not enrolled he should not get this data.
    const enrollment = await prisma.enrollment.findUnique({
        where: {
            userId_courseId: {
                userId: session.id,
                courseId: lesson.Chapter.courseId,
            },
        },
        select: {
            status: true,
        },
    });
    if (!enrollment || enrollment.status !== "Active") {
        return notFound();
    }
    return lesson;
}

//creating a dynamic type
export type LessonContentType = Awaited<ReturnType<typeof getLessonContent>>

