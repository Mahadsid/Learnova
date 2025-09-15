import { adminGetCourses } from "@/app/dataAcclyr/admin/admin-get-courses";
import { buttonVariants } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { AdminCourseCard, AdminCourseCardSkeleton } from "./_components/AdminCourseCard";
import { EmptyState } from "@/components/general/EmptyState";
import { Suspense } from "react";

export default function CoursesPage() {
    
    return (
        <>
            <div className=" flex items-center justify-between">
                <h1 className="text-2xl font-bold">Your Courses</h1>
                <Link href='/admindashboard/courses/create' className={buttonVariants()}>Create Course <PlusIcon className="ml-1" size={16}/></Link>
            </div>
            {/* {
                data.length === 0
                    ?
                    <EmptyState buttonText="Create Course" description="Hey Admin! Create new course here.🌟" title="No courses found. 💔" href="/admindashboard/courses/create"/>
                    :
                    (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-7">
                        {data.map((course) => (
                        <AdminCourseCard key={course.id} data={course} />
                        ))}
                        </div>    
                    )
            } */}

            {/* STREAMING: BCZ WE IMPLEMENT STRAMING HERE WE TAKE THE ABOVE TERINARY CAODE AND CREATE A NEW FUCTION OUT OF IT TO RENDER HERE!
            * We wrap our component in suspense from react and while data is loading the fallback skeleton is shown which we get from shadcn (https://ui.shadcn.com/docs/components/skeleton) from AdminCourseCard.tsx. 
           * NOTE: We load our skeleton from AdminCourseCard.tsx bcz it is a server component, we cannot create it here bcz it is a client comonent! always load skeleton from server component.
            */}
            <Suspense fallback={<AdminCourseCardSkeletonLayout />}>
                <RenderCourses />
            </Suspense>
        </>
    )
}

//STREAMING in nextjs, when we load data, till the data is loaded show skeleton, and where data is not loaded show them quickly! read docs here :- https://nextjs.org/learn/dashboard-app/streaming
//here we implement it another way, more preferred way is like the docs way or using suspense boundaries!

async function RenderCourses() {
    const data = await adminGetCourses();
    return (
        <>
            {
                data.length === 0
                    ?
                    <EmptyState buttonText="Create Course" description="Hey Admin! Create new course here.🌟" title="No courses found. 💔" href="/admindashboard/courses/create"/>
                    :
                    (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-7">
                        {data.map((course) => (
                        <AdminCourseCard key={course.id} data={course} />
                        ))}
                        </div>    
                    )
            }
        </>
    )
}

//creating array of skeletons bcz on that file we created only one skeleton here we can make it multiple.
function AdminCourseCardSkeletonLayout() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-7">
            {Array.from({ length: 4 }).map((_, index) => (
                <AdminCourseCardSkeleton key={index} />
            ))}
        </div>
    )
}