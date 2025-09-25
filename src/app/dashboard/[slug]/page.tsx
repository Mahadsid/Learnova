import { getCourseSidebarData } from "@/app/dataAcclyr/course/get-course-sidebar-data";
import { redirect } from "next/navigation";


interface iAppProps{
    // name should match dynamic folder name in his case [slug] bcz we are getting it from URL. 
    params: Promise<{ slug: string }>;
}

export default async function CourseSlugRoute({params}: iAppProps) {
    const { slug } = await params;
    const course = await getCourseSidebarData(slug);

    //redirecting user to first chapter firsts lesson.
    const firstChapter = course.course.chapter[0];
    const firstlesson = firstChapter.lessons[0];
    if (firstlesson) {
        redirect(`/dashboard/${slug}/${firstlesson.id}`)
    }

    return (
        <div className="flex items-center justify-center h-full text-center">
            <h2 className="text-2xl font-bold mb-2">No lesson found!
            </h2>
        </div>
    );
}