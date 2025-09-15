"use client"

import { AdminLessonType } from "@/app/dataAcclyr/admin/admin-get-lesson"
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { lessonSchema, LessonSchemaType } from "@/lib/ZodSchema";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/rich-text-editor/Editor";
import { Uploader } from "@/components/file-uploader/Uploader";
import { useTransition } from "react";
import { tryCatch } from "@/hooks/try-catch";
import { updateLesson } from "../actions";
import { toast } from "sonner";


interface iAppProps {
    data: AdminLessonType;
    chapterId: string;
    courseId: string;
}

export function LessonForm({ chapterId, courseId, data }: iAppProps) {
    
    const [pending, startTransition] = useTransition()

    //1. make form using zod, & define initial values: {from zod docs}
    const form = useForm<LessonSchemaType>({
        resolver: zodResolver(lessonSchema),
        defaultValues: {
            name: data.title,
            chapterId: chapterId,
            courseId: courseId,
            description: data.description ?? undefined,
            videoKey: data.videoKey ?? undefined,
            thumbnailKey: data.thumbnailKey ??  undefined,
        }
    });

    //2. define a submit handler {from zod docs} & make form like below
    function onSubmit(values: LessonSchemaType) {
        // do something with form values
        // console.log(values);

        startTransition(async () => {
            const { data: result, error } = await tryCatch(updateLesson(values, data.id));
            
            if (error) {
                // this checking for error failed in server side (server action, action.ts)
                toast.error("An unexpected error has occured. Please try again.");
                return;
            }

            if (result.status === "success") {
                toast.success(result.message);
            } else if(result.status === "error") {
                toast.error(result.message)
            }
        })

    }

    return (
        <div>
            <Link className={buttonVariants({ variant: "outline", className: "mb-6" })} href={`/admindashboard/courses/${courseId}/edit`}>
                <ArrowLeft className="size-4" />
                <span>Go Back</span>
            </Link>

            <Card>
                <CardHeader>
                    <CardTitle>Construct Lesson</CardTitle>
                    <CardDescription>
                        Upload the video & enter description for the lesson.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form} >
                        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                            {/* NAME */}
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Lesson Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Chapter xyz" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            {/* DESCRIPTION */}
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <RichTextEditor field={field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            {/* THUMBNAIL KEY */}
                            <FormField control={form.control} name="thumbnailKey" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Thumbnail Image</FormLabel>
                                    <FormControl>
                                        <Uploader onChange={field.onChange} value={field.value} fileTypeAccepted="image" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            {/* VIDEO KEY */}
                            <FormField control={form.control} name="videoKey" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Video File</FormLabel>
                                    <FormControl>
                                        <Uploader onChange={field.onChange} value={field.value} fileTypeAccepted="video" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            {/* SUBMITT BUTTON */}
                            <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save Lesson"}</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}