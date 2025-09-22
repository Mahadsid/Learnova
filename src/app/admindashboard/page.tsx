import { ChartAreaInteractive } from "@/components/sidebar/chart-area-interactive";
//import { DataTable } from "@/components/sidebar/data-table";
import { SectionCards } from "@/components/sidebar/section-cards";
import { adminGetEnrollmentStats } from "../dataAcclyr/admin/admin-get-enrollment-stats";
import Link from "next/link";
import { adminGetRecentCourses } from "../dataAcclyr/admin/admin-get-recent-courses";
import { EmptyState } from "@/components/general/EmptyState";
import { AdminCourseCard, AdminCourseCardSkeleton } from "./courses/_components/AdminCourseCard";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
//import data from "./data.json"

export default async function AdminIndexPage() {
  const enrollmentData = await adminGetEnrollmentStats();
  return (
    <>
      <SectionCards />


      {/* <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>  taking this outside div to imporove padding*/}


      <ChartAreaInteractive data={enrollmentData} />



      {/* <DataTable data={data} /> */}
      {/* commenting this data table bcz of some modification. */}

      {/* Button to take to see all courses and preview two courses.*/}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Courses</h2>
          <Link href="/admindashboard/courses" className={buttonVariants({variant: "outline"})}>
            Veiw all courses
            <ArrowRight className="size-4"/>
          </Link>
        </div>
        <Suspense fallback={<RenderRecentCoursesSkeletonLayout />}><RenderRecentCourses /> </Suspense>
      </div>
    </>
  )
}

async function RenderRecentCourses() {
  const data = await adminGetRecentCourses();
  if (data.length === 0) {
    return (
      <EmptyState buttonText="Create new Course" description="You dont have any courses. create or publish new courses." title="You dont have courses yet!" href="/admindashboard/courses/create" />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {data.map((course) => (
        <AdminCourseCard key={course.id} data={course} />
      ))}
    </div>
  );
}

function RenderRecentCoursesSkeletonLayout() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: 2 }).map((_, index) => (
        <AdminCourseCardSkeleton key={index} />
      ))}
    </div>
  )
}