import { adminGetCourses } from "@/app/dataAcclyr/admin/admin-get-courses";
import { buttonVariants } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { AdminCourseCard } from "./_components/AdminCourseCard";

export default async function CoursesPage() {
    const data = await adminGetCourses();
    return (
        <>
            <div className=" flex items-center justify-between">
                <h1 className="text-2xl font-bold">Your Courses</h1>
                <Link href='/admindashboard/courses/create' className={buttonVariants()}>Create Course <PlusIcon className="ml-1" size={16}/></Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-7">
                {data.map((course) => (
                    <AdminCourseCard key={course.id} data={course} />
                ))}
            </div>
        </>
    )
}