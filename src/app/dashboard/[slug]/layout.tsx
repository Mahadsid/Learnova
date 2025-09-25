import { ReactNode } from "react";
import { CourseSidebar } from "../_components/CourseSidebar";
import { getCourseSidebarData } from "@/app/dataAcclyr/course/get-course-sidebar-data";

interface iAppProps{
    // name should match dynamic folder name in his case [slug] bcz we are getting it from URL. 
    params: Promise<{ slug: string }>;
    children: ReactNode;
}

export default async function CourseLayout({ children, params }: iAppProps) {
    const { slug } = await params;

    //getting course data specific from course slug.
    const course = await getCourseSidebarData(slug);


    return (
        <div className="flex flex-1">
            {/* sidebar 30% */}
            <div className="w-80 border-r border-border shrink-0">
                {/* passing course data to coursesidebar component. */}
                <CourseSidebar course={course.course}/>
            </div>

            {/* main content  -70% */}
            <div className="flex-1 overflow-hidden">{ children }</div>
        </div>
    )
}