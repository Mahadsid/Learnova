import { adminGetCourse } from "@/app/dataAcclyr/admin/admin-get-course"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditCourseForm } from "./_components/EditCourseForm";
import { CourseStructure } from "./_components/CourseStructure";

//since we are getting the course id from the URL, we created this dymanic route called [courseId] so in nextjs15 we get it through params simply using a promise!
type Params = Promise<{courseId: string}>

export default async function EditRoute({ params }: { params: Params }) {

    const { courseId } = await params;

    //to get the data we created a new data access lyr, for getting a singular course we created new function named below, check admin-get-course.ts file! 
    const data = await adminGetCourse(courseId);
    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">
            Edit Course: {" "}
            <span className="text-primary underline">{data.title}</span>
        </h1>
        <Tabs defaultValue="basic-info" className="w-full">
                <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
                    <TabsTrigger value="course-structure">Course Structure</TabsTrigger>
                </TabsList>

                {/* Basic info tab-button */}
                <TabsContent value="basic-info">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Info</CardTitle>
                            <CardDescription>
                                Provide basic information about the course.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* passing the data to prepopulte the form */}
                            <EditCourseForm data={data}/>
                        </CardContent>
                    </Card>
                </TabsContent>
                {/* course structure tab-button */}
                <TabsContent value="course-structure">
                    <Card>
                        <CardHeader>
                            <CardTitle>Course Structure</CardTitle>
                            <CardDescription>
                                Edit your course structure here.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/*_componets/CourseStructure.tsx:   */}
                            <CourseStructure data={data}/>
                        </CardContent>
                    </Card>
                </TabsContent>
        </Tabs>
        </div>
    )
}