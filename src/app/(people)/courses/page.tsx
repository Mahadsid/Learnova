import { getAllCourses } from "@/app/dataAcclyr/course/get-all-courses"
import { PublicCourseCard, PublicCourseCardSkeleton } from "../_components/PublicCourseCard";
import { Suspense } from "react";


export default function PublicCoursesRoute() {
    return (
        <div className="mt-5">
            <div className="flex flex-col space-y-2 mb-10">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">
                    Checkout Courses!
                </h1>
                <p className="text-muted-foreground">
                    Explore new on demand courses to kick start the spaceship of your career.
                </p>
            </div>
            <Suspense fallback={<LoadingSkeletonLayout />}>
                <RenderCourses />
            </Suspense>
        </div>
    )
}

async function RenderCourses() {
    //getting all courses from server action!.
    const courses = await getAllCourses();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {
                courses.map((course) => (
                    <PublicCourseCard key={course.id} data={course}/>
                ))
            }
        </div>
    )
}

function LoadingSkeletonLayout() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, index) => (
                <PublicCourseCardSkeleton key={index}/>
            ))}
        </div>
    )
}