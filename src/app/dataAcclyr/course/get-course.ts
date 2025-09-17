import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

//this is public facing course route,  in this function we get detail for a single course on which user clicked and display that!
export async function getIndividualCourse(slug: string) {
    const course = await prisma.course.findUnique({
        where: {
            slug: slug, //thats why we make slug unique in DB.
        },
        select: {
            id: true,
            title: true,
            description: true,
            fileKey: true,
            price: true,
            duration: true,
            level: true,
            category: true,
            smallDescription: true,
            chapter: { 
                select: {
                    id: true,
                    title: true,
                    lessons: {
                        select: {
                            id: true,
                            title: true,
                        },
                        orderBy: {
                            position: "asc", // sort lesseon ascending 1, 2, 3....
                        },
                    },
                }, 
                orderBy: {
                    position: "asc", //sort chapter ascending 1, 2, 3 ..
                },
            },
        },
    });

    //if slug is incorrect then we dont get course so notfound page
    if (!course) {
        return notFound();
    }

    //else all right return data
    return course;
}