import { EmptyState } from "@/components/general/EmptyState";
import { getAllCourses } from "../dataAcclyr/course/get-all-courses"
import { getEnrolledCourses } from "../dataAcclyr/user/get-enrolled-courses";
import { PublicCourseCard } from "../(people)/_components/PublicCourseCard";
import Link from "next/link";
import { CourseProgressCard } from "./_components/CourseProgressCard";

export default async function DashboardPage() {

  const [courses, enrolledCourses] = await Promise.all([getAllCourses(), getEnrolledCourses()]);
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Enrolled Courses</h1>
        <p className="text-muted-foreground">Courses you have access to </p>
      </div>

      {/* defence code to check if user is enrolled in a course or not */}
      {
        enrolledCourses.length === 0
          ?
          (<EmptyState title="No courses purchased." description="You are not enrolled in any courses." buttonText="Checkout Courses" href="/courses"/>)
          :
          (<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrolledCourses.map((course) => (
              <CourseProgressCard data={course} key={course.Course.id}/>
            ))}
          </div>)
      }


      <section className="mt-10">
        <div className="flex flex-col gap-2 mb-5">
        <h1 className="text-3xl font-bold">Available Courses</h1>
        <p className="text-muted-foreground">Courses you can purchase</p>
        </div>
        {/* couses user can purchase but since user can have already purchased some courses so we dont want to show that courses so we filter that courses. also if its length zomes out zero that means all courses have been purchased */}
        {courses.filter(
          (course) =>
            !enrolledCourses.some(
              ({ Course: enrolled }) => enrolled.id === course.id)
        ).length === 0
          ?
          (
            <EmptyState title="No courses available" description="You have already purchased all available courses." buttonText="Checkout Courses" href="/courses"/>
          ) 
          :
          (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.filter(
                (course) =>
                !enrolledCourses.some(
                ({ Course: enrolled }) => enrolled.id === course.id)
              ).map(
                (course) => (
                <PublicCourseCard key={course.id} data={course}/>
              ))
              }
            </div>
          )
        }
      </section>
    </>
  )
}