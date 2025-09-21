'use client'

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { courseCategories, courseLevels, courseSchema, CourseSchemaType, courseStatus } from "@/lib/ZodSchema";
import { ArrowLeft, Loader2, PlusIcon, SparkleIcon } from "lucide-react";
import Link from "next/link";
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
import { CreateCourse } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {  useConfetti } from "@/hooks/use-confetti";





export default function CourseCreationPage() {

    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const { triggerConfetti } = useConfetti();
    
    //1. make form using zod, & define initial values: {from zod docs}
    const form = useForm<CourseSchemaType>({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            title: "",
            description: "",
            fileKey: "",
            price: 0,
            duration: 0,
            level: "Beginner",
            category: "IT & Software",
            status: "Draft",
            slug: "",
            smallDescription: "",
        }
    });
    //2. define a submit handler {from zod docs}
    function onSubmit(values: CourseSchemaType) {
        // do something with form values
        // console.log(values);

        startTransition(async () => {
            const { data: result, error } = await tryCatch(CreateCourse(values));
            
            if (error) {
                // this checking for error failed in server side (server action, action.ts)
                toast.error("An unexpected error has occured. Please try again.");
                return;
            }

            if (result.status === "success") {
                toast.success(result.message);
                triggerConfetti();
                form.reset()
                //since this is client side we use useRouter from and for navigation.
                router.push('/admindashboard/courses')
            } else if(result.status === "error") {
                toast.error(result.message)
            }
        })

    }
    return (
        <>
            <div className="flex items-center gap-4">
                <Link href='admindashboard/courses' className={buttonVariants({ variant: 'outline', size: 'icon' })}><ArrowLeft className="size-4" /></Link>
                <h1 className="text-2xl font-bold">Create Courses</h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Create Your Course</CardTitle>
                    <CardDescription>
                        Enter details about your course!
                    </CardDescription>
                </CardHeader>
                <CardContent>
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
                                            <Uploader onChange={field.onChange} value={field.value} fileTypeAccepted="image" />
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
                                        <FormLabel>Price (€)</FormLabel>
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
                                            Creating...
                                            <Loader2 className="animate-spin ml-1"/>
                                        </>
                                    :
                                        <>
                                            Create Course <PlusIcon className="ml-1" size={16} />
                                        </>
                                }
                            </Button>

                        </form>
                    </Form>
                </CardContent>
            </Card>
        </>
    )
}