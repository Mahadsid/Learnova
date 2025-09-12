"use client"
import { Button } from "@/components/ui/button";

import { courseCategories, courseLevels, courseSchema, CourseSchemaType, courseStatus } from "@/lib/ZodSchema";
import {  Loader2, PlusIcon, SparkleIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import slugify from 'slugify';
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { RichTextEditor } from "@/components/rich-text-editor/Editor";
import { Uploader } from "@/components/file-uploader/Uploader";
import { useTransition } from "react";
import { tryCatch } from "@/hooks/try-catch";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { editCourse } from "../actions";
import { AdminCourseSingularType } from "@/app/dataAcclyr/admin/admin-get-course";

interface iAppProps {
    //getting course data from server action check admin-get-course.ts this way we get data to pre populate the form also get the courseID we need to pass as params to update course in actions.ts, THIS IS THE DYNAMIC TYPE FOR IT TO WORK PROPERLY IN TYPECRIPT, CHECK admin-get-course.ts FILE LAST LINE!!!
    data: AdminCourseSingularType
}


//RECEVING " DATA " FROM PAGE.TSX (EDIT FORM PAGE), THIS DATA WE GET FROM admin-get-course.ts WE PRE-POPULATE THE FORM WITH THIS!!! ALSO THIS DATA ALSO CONTAIN THE courseId Which we need to pass to serveraction action.ts file FOR UPDATING THE COURSE WHEN UPDATE BUTTON IS CLICKED!!!
export function EditCourseForm({ data } : iAppProps) {

    const [isPending, startTransition] = useTransition();
    const router = useRouter()


     //1. make form using zod, & define initial values: {from zod docs}
    const form = useForm<CourseSchemaType>({
        resolver: zodResolver(courseSchema),
        //default values cannot be empty bcz we have data already when course is created so we get that data from server action and pre populate the form with that data, this way we also get our courseId which we need to pass throgh arguments for update course in actions.ts
        defaultValues: {
            title: data.title, //data we recieved from server action
            description: data.description,
            fileKey: data.fileKey,
            price: data.price,
            duration: data.duration,
            level: data.level,
            category: data.category as CourseSchemaType['category'], //since cateogry singular string cannot be attached to category string array, so we add the type " as CourseSchemaType['category'] "
            status: data.status,
            slug: data.slug,
            smallDescription: data.smallDescription,
        }
    });
    //2. define a submit handler {from zod docs}
    function onSubmit(values: CourseSchemaType) {
        // do something with form values
        // console.log(values);

        startTransition(async () => {
            //editCourse server action require two things, 1.data (we get from edit form), 2. courseId we get from page.tsx which was retrieved from admin-get-course in page.tsx file!.
            const { data: result, error } = await tryCatch(editCourse(values, data.id));
            
            if (error) {
                // this checking for error failed in server side (server action, action.ts)
                toast.error("An unexpected error has occured. Please try again.");
                return;
            }

            if (result.status === "success") {
                toast.success(result.message);
                form.reset()
                //since this is client side we use useRouter from and for navigation.
                router.push('/admindashboard/courses')
            } else if(result.status === "error") {
                toast.error(result.message)
            }
        })

    }
    return (
        <Form {...form}>
                        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                            <FormField
                                control={form.control}
                                name="title"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Title" {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}  
                            />
                            {/* SLUG & SLUGIFY */}
                            <div className="flex gap-4 items-end">
                                <FormField
                                control={form.control}
                                name="slug"
                                render={({field}) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Slug</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Slug" {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}  
                                />
                                <Button type="button" className="w-fit" onClick={() => {
                                    const titleValue = form.getValues("title");
                                    const slug = slugify(titleValue);
                                    form.setValue('slug',slug, {shouldValidate: true})
                                }}>
                                    Generate Slug <SparkleIcon className="ml-1" size={16} />
                                </Button>
                            </div>
                            {/* Form descriptionSS sections */}
                            <FormField
                                control={form.control}
                                name="smallDescription"
                                render={({field}) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Small Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Small Description ... " className="min-h-[120]" {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}  
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({field}) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <RichTextEditor field={field}/>
                                            {/* <Textarea placeholder="Description ... " className="min-h-[120]" {...field} /> */}
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}  
                            />
                            <FormField
                                control={form.control}
                                name="fileKey"
                                render={({field}) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Thumbnail Image</FormLabel>
                                        <FormControl>
                                            <Uploader onChange={field.onChange} value={field.value} />
                                            {/* <Input placeholder="Thumbnail URL"  {...field} /> */}
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}  
                            />

                            {/* Form selection components */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="category"
                                render={({field}) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue
                                                    placeholder='Select Category'/>
                                                </SelectTrigger>
                                            </FormControl>
                                                <SelectContent>
                                                    {courseCategories.map((category) => (
                                                        <SelectItem key={category} value={category}>
                                                            {category}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                        </Select>
                                        <FormMessage/>
                                    </FormItem>
                                )}  
                            />
                                
                            <FormField
                                control={form.control}
                                name="level"
                                render={({field}) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Level</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select Category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {courseLevels.map((category) => (
                                                    <SelectItem key={category} value={category}>
                                                        {category}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage/>
                                    </FormItem>
                                )}  
                            />
                                {/* Price & Duration (NUMBER) */}
                            <FormField
                                control={form.control}
                                name="duration"
                                render={({field}) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Duration (hrs)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Duration" type="number" {...field} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value === "" ?undefined : Number(e.target.value))} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}  
                            />
                                
                            <FormField
                                control={form.control}
                                name="price"
                                render={({field}) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Price ($)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Price" type="number" {...field} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}  
                            />
                                
                            </div>
                                {/* Statuts select */}
                            <FormField
                                control={form.control}
                                name="status"
                                render={({field}) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue
                                                    placeholder='Select Status'/>
                                                </SelectTrigger>
                                            </FormControl>
                                                <SelectContent>
                                                    {courseStatus.map((category) => (
                                                        <SelectItem key={category} value={category}>
                                                            {category}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                        </Select>
                                        <FormMessage/>
                                    </FormItem>
                                )}  
                            />
                            
                            <Button type="submit" disabled={isPending}>
                                {
                                    isPending
                                    ?
                                        <>
                                            Updating...
                                            <Loader2 className="animate-spin ml-1"/>
                                        </>
                                    :
                                        <>
                                            Update Course<PlusIcon className="ml-1" size={16} />
                                        </>
                                }
                            </Button>

                        </form>
                    </Form>
 )   
}