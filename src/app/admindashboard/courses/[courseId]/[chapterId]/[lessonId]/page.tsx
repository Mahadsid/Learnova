import { adminGetLesson } from "@/app/dataAcclyr/admin/admin-get-lesson";
import { LessonForm } from "./_components/LessonForm";

type Params = Promise<{
    //make sure name matches the folder name bcz we get these data fron URL params.
    courseId: string; 
    chapterId: string;
    lessonId: string;
}>

export default async function lessonIdPage({ params }: { params: Params }) {
    const { chapterId, courseId, lessonId } = await params;
    //get data from data acc lyr
    const lesson = await adminGetLesson(lessonId);

    //create form, this is server component, so creating another file for using react-hook-form which uses client side activities.
    return (
        <div>
            <LessonForm chapterId={chapterId} data={lesson} courseId={courseId} />
        </div>
    )

}