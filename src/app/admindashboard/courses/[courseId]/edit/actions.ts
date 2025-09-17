"use server";

import { requireAdmin } from "@/app/dataAcclyr/admin/require-admin";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { chapterSchema, ChapterSchemaType, courseSchema, CourseSchemaType, lessonSchema } from "@/lib/ZodSchema";
import { request } from "@arcjet/next";
import { revalidatePath } from "next/cache";


// securing api with arcjet, configurating it
const aj = arcjet
// .withRule(
//     detectBot({
//         mode: "LIVE",
//         allow: [],
//     })
// )we-commented or can delete this bcz we implemented detectbot in middleware so it intercept bot at every request no need to deifne it here again! read docs to read docs see middleware.ts file more info there.
.withRule(
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


// server action to update in database for reordering lessons , and maintaining their positions in DB
export async function reorderLessons(chapterId: string, lessons: { id: string; position: number }[], courseId: string): Promise<ApiResponse> {
    // user should only be admin, bcz we give admin oly privilage to make course so only admin can edit course/chapter/lesson. 
    await requireAdmin();
    try {
        if (!lessons || lessons.length === 0) {
            return {
                status: "error",
                message: "No lessons provided for reordering",
            };
        }
        const updates = lessons.map((lesson) => prisma.lesson.update({
            where: {
                id: lesson.id,
                chapterId: chapterId,
            },
            data: {
                position: lesson.position,
            }
        }));
        await prisma.$transaction(updates);
        revalidatePath(`/admindashboard/courses/${courseId}/edit`);
        return {
            status: "success",
            message: "Lesson reordered successfully.",
        }
    } catch {
        return {
            status: 'error',
            message: 'Failed to reorder lessons.'
        }
    }
}

// Server action to to update in database for reordering chapters , and maintaining their positions in DB
export async function reorderChapters(courseId: string, chapters: { id: string; position: number }[]): Promise<ApiResponse> {
    // user should only be admin, bcz we give admin oly privilage to make course so only admin can edit course/chapter/lesson. 
    await requireAdmin();
    try {
        if (!chapters || chapters.length === 0) {
            return {
                status: "error",
                message: "No chapters provided for reordering."
            };
        }
        const updates = chapters.map((chapter) => prisma.chapter.update({
            where: {
                id: chapter.id,
                courseId: courseId,
            },
            data: {
                position: chapter.position,
            },
        }));
        await prisma.$transaction(updates);
        revalidatePath(`/admindashboard/courses/${courseId}/edit`);
        return {
            status: "success",
            message: "Chapters reordered successfully.",
        }
    } catch {
        return {
            status: "error",
            message: "Failed to reorder chapters.",
        }
    }
}

//server action for creating a new chapter using chapter modal
export async function createChapter(values: ChapterSchemaType): Promise<ApiResponse> {
    // user should only be admin, bcz we give admin oly privilage to make course so only admin can edit course/chapter/lesson.
    await requireAdmin();
    try {
        //getting values from form, parsing it against our schema 
        const result = chapterSchema.safeParse(values);
        //defense code
        if (!result.success) {
            return {
                status: "error",
                message: "Invalid data, cannot create chapter."
            }
        };
        //creating mutation to update data in DB.
        // we create new chapter in last position for every new chapter, putting them at last in list of chapters
        await prisma.$transaction(async (tx) => {
            // getting the max position in the list of chapters
            const maxPos = await tx.chapter.findFirst({
                where: {
                    courseId: result.data.courseId,
                },
                select: {
                    position: true,
                },
                orderBy: {
                    position: "desc",
                }
            });

            await tx.chapter.create({
                data: {
                    title: result.data.name,
                    courseId: result.data.courseId,
                    position: (maxPos?.position ?? 0) + 1 //since this new chapter will append in position one greater than the last/max position. (maxPos?.position ?? 1) -> this means when chapters array is empty like say at starting when we dont have any chapters then the position for new chapter will be zero in the list. 
                }
            });
        });

        revalidatePath(`/admindashboard/courses/${result.data.courseId}/edit`);

        return {
            status: 'success',
            message: "Chapter created successfully."
        }

    } catch  {
        return {
            status: "error",
            message: "Failed to create chapter."
        }
    }
}


//server action for creating a new Lesson using lesson modal
export async function createLesson(values: ChapterSchemaType): Promise<ApiResponse> {
    // user should only be admin, bcz we give admin oly privilage to make course so only admin can edit course/chapter/lesson.
    await requireAdmin();
    try {
        //getting values from form, parsing it against our schema 
        const result = lessonSchema.safeParse(values);
        //defense code
        if (!result.success) {
            return {
                status: "error",
                message: "Invalid data, cannot create lesson."
            }
        };
        //creating mutation to update data in DB.
        // we create new lesson in last position for every new lesson, putting them at last in list of lessons
        await prisma.$transaction(async (tx) => {
            // getting the max position in the list of lesson
            const maxPos = await tx.lesson.findFirst({
                where: {
                    chapterId: result.data.chapterId,
                },
                select: {
                    position: true,
                },
                orderBy: {
                    position: "desc",
                }
            });

            await tx.lesson.create({
                data: {
                    title: result.data.name,
                    description: result.data.description,
                    videoKey: result.data.videoKey,
                    thumbnailKey: result.data.thumbnailKey,
                    chapterId: result.data.chapterId,
                    position: (maxPos?.position ?? 0) + 1 //since this new lesson will append in position one greater than the last/max position. (maxPos?.position ?? 1) -> this means when lesson array is empty like say at starting when we dont have any lessons then the position for new lesson will be zero in the list but we are adding + 1 so now index start at 1 and not zero. so first index at 1 then 2 and so on... 
                }
            });
        });

        revalidatePath(`/admindashboard/courses/${result.data.courseId}/edit`);

        return {
            status: 'success',
            message: "Lesson created successfully."
        }

    } catch  {
        return {
            status: "error",
            message: "Failed to create lesson."
        }
    }
}


// +++++++++++ DELETION SERVER ACTIONS ++++++++++++

export async function deleteLesson({ chapterId, courseId, lessonId }: { chapterId: string; courseId: string; lessonId: string; }): Promise<ApiResponse> {
    await requireAdmin();
    try {
        // OVERVIEW: geting all lessons bcz we need positions of lessons bcz once deleted we may have to reorder other lessons.

        // 1. get the chapter in which the lesson resides, so that we can get more lessons from that chapter in order to reorder once that specific lesson is deleted. !!chapter ID is provided by us through params.!!
        const chapterWithLessons = await prisma.chapter.findUnique({
            where: {
                id: chapterId,
            },
            select: {
                lessons: { // getting lessons 
                    orderBy: { // sorting them 
                        position: "asc", // sort then ascending like [1, 2, 3, ...]
                    },
                    select: {
                        id: true, // getting id &
                        position: true, //positions for all lessons
                    }
                }
            }
        });
        //defense code, if that chapter do not exists
        if (!chapterWithLessons) {
            return {
                status: "error",
                message: "Chapter not found or no such chapter."
            }
        }

        // now we have data/chapter, so we can get lessons, 
        const lessons = chapterWithLessons.lessons;
        //& lessons is an array and we want to delete specific lesson, !! that specific lesson ID is what we provide through params. !!
        const lessonToDelete = lessons.find((lesson) => lesson.id === lessonId)
        // defense code if we dont find that lesson id
        if (!lessonToDelete) {
            return {
                status: "error",
                message: "Lesson not found in the chapter."
            }
        }

        // 2. generate new array of lessons with updated positions.
        // creating array of items/lessons where the specific lessonId does not match with other lesson ids hence we get array of remaining lessons  
        const remaininglessons = lessons.filter((lesson) => lesson.id !== lessonId);
        // REORDERING POSITIONS of remaining lessons
        const updates = remaininglessons.map((lesson, index) => {
            return prisma.lesson.update({
                where: {
                    id: lesson.id // updating lesson where it matches the ids
                },
                data: {
                    position: index + 1 // since js is zero based we add + 1, so our index start with 1, we also did this when creating the lessons.
                },
            })
        });

        // all these actions can be done in singular DB call thats why we use $transaction, on upper prisma.lesson.update no DB call is made we just configure it, mutation is done here on transaction call.
        //Another benifit of transaction is, if one of the command or updates failed, whone transaction failed, it keeps ATOMIC PROPERTY OF DATABASE so everything remain concurrent.
        await prisma.$transaction([
            ...updates,
            prisma.lesson.delete({
                where: {
                    id: lessonId,
                    chapterId: chapterId,
                },
            }),
        ]);

        //to revalidate our cache again
        revalidatePath(`/admindashboard/courses/${courseId}/edit`);

        return {
            status: "success",
            message: "Lesson deleted successfully."
        }

    } catch {
        return {
            status: "error",
            message: "Failed to delete lesson."
        }
    }
}


export async function deleteChapter({ chapterId, courseId }: { chapterId: string; courseId: string; }): Promise<ApiResponse> {
    await requireAdmin();
    try {
        // OVERVIEW: geting all chapters bcz we need positions of chapters bcz once deleted we may have to reorder other chapters.

        // 1. get the course in which the chapter resides, so that we can get more chapters from that course in order to reorder once that specific chapter is deleted. !!course ID is provided by us through params.!!
        const courseWithChapters = await prisma.course.findUnique({
            where: {
                id: courseId,
            },
            select: {
                chapter: { // getting chapter 
                    orderBy: { // sorting them 
                        position: "asc", // sort then ascending like [1, 2, 3, ...]
                    },
                    select: {
                        id: true, // getting id &
                        position: true, //positions for all chapters
                    },
                },
            },
        });
        //defense code, if that course do not exists
        if (!courseWithChapters) {
            return {
                status: "error",
                message: "Course not found or no such course."
            }
        }

        // now we have data/course, so we can get chapters, 
        const chapters = courseWithChapters.chapter;
        //& chapter is an array and we want to delete specific chapter, !! that specific chapter ID is what we provide through params. !!
        const chapterToDelete = chapters.find((chapter) => chapter.id === chapterId)
        // defense code if we dont find that chapter id
        if (!chapterToDelete) {
            return {
                status: "error",
                message: "Chapter not found in the course."
            }
        }

        // 2. generate new array of chapter with updated positions.
        // creating array of items/chapters where the specific chapterId does not match with other chapter ids hence we get array of remaining chapters  
        const remainingchapters = chapters.filter((chapter) => chapter.id !== chapterId);
        // REORDERING POSITIONS of remaining chapters
        const updates = remainingchapters.map((chapter, index) => {
            return prisma.chapter.update({
                where: {
                    id: chapter.id // updating chapter where it matches the ids
                },
                data: {
                    position: index + 1 // since js is zero based we add + 1, so our index start with 1, we also did this when creating the lessons.
                },
            });
        });

        // all these actions can be done in singular DB call thats why we use $transaction, on upper prisma.lesson.update no DB call is made we just configure it, mutation is done here on transaction call.
        //Another benifit of transaction is, if one of the command or updates failed, whone transaction failed, it keeps ATOMIC PROPERTY OF DATABASE so everything remain concurrent.
        await prisma.$transaction([
            ...updates,
            prisma.chapter.delete({
                where: {
                    id: chapterId,
                },
            }),
        ]);

        //to revalidate our cache again
        revalidatePath(`/admindashboard/courses/${courseId}/edit`);

        return {
            status: "success",
            message: "Chapter deleted successfully."
        }

    } catch {
        return {
            status: "error",
            message: "Failed to delete chapter."
        }
    }
}