import "server-only";
import { prisma } from "@/lib/db";

// This is for public seeing courses, we get courses and only published course, sort them with newest created first shown.
export async function getAllCourses() {
    const data = await prisma.course.findMany({
        where: {
            status: "Published"
        },
        orderBy: {
            createdAt: "desc", // we will get the newest result first.
        },
        select: {
            title: true,
            price: true,
            smallDescription: true,
            slug: true,
            fileKey: true,
            id: true,
            level: true,
            duration: true,
            category: true,
        },
    });
    return data;
}
// To get dynamic types out of the above function! it returns array! so to get singular item we destructure it by using [0]
export type PublicCourseType = Awaited<ReturnType<typeof getAllCourses>>[0]