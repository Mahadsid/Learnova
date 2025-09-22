import "server-only";
import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";

export async function adminGetDashboardStats() {
    await requireAdmin();

    const [totalSignups, totalCustomers, totalCourses, totalLessons] = await Promise.all([
        //total signups
        prisma.user.count(),

        //total customers
        prisma.user.count({
            where: {
                //where enrollment is active so we can say some and it will give customers
                enrollment: {
                    //this is prisma relation filter , that will find us  users which have atleast one enrollenment record.
                    some: {},
                },
            },
        }),
        
        //total courses
        prisma.course.count(),

        //total lessons
        prisma.lesson.count(),
    ]);

    return {
        totalSignups, totalCustomers, totalCourses, totalLessons
    }
}