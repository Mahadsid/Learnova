import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";

export async function adminGetCourses() {
    await requireAdmin();

    const data = await prisma.course.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        select: {
            id: true,
            title: true,
            smallDescription: true,
            duration: true,
            level: true,
            status: true,
            price: true,
            fileKey: true,
            slug: true,
        },
    });
    return data;
}


// To get dynamic types out of the above function! it returns array! so to get singular item we destructure it by using [0]
export type AdminCourseType = Awaited<ReturnType<typeof adminGetCourses>>[0]