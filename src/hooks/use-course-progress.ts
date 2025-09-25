"use client";
import { CourseSidebarDataType } from "@/app/dataAcclyr/course/get-course-sidebar-data";
import { useMemo } from "react";

interface iAppProps {
    courseData : CourseSidebarDataType["course"]
}

interface CourseProgressResult {
    totalLessons: number;
    completedLessons: number;
    progressPercentage: number;

}


export function useCourseProgress({courseData}: iAppProps): CourseProgressResult {

    //use Memo hook is to just improve performance so that it dont calculate again.
    return useMemo(() => {
        //totalLesson counts every lesson in every chapter.
        let totalLessons = 0;
        //completedlessons counts progress of lesson completed or not by checking completed boolean we created.
        let completedLessons = 0;

        // outer loop iterates over each chapter in the course.
        courseData.chapter.forEach((chapter) => {
            // inner loop iterates over each lessons inside a chapter.
            chapter.lessons.forEach((lesson) => {
                //incrementing count as each lesson is found.
                totalLessons++;

                //check if this lesson is completed, checking if any progress record exists
                const isCompleted = lesson.lessonProgress.some(
                    // === makes sure we are looking for correct lesson and is it completed
                    (progress) => progress.lessonId === lesson.id && progress.completed
                );
                if (isCompleted) {
                    //if yes completed then we increase completed count.
                    completedLessons++;
                }

            });
        });
        const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        return {
            totalLessons,
            completedLessons,
            progressPercentage,
        }
    }, [courseData]);
}