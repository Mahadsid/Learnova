import {z} from 'zod'

export const courseLevels = ['Beginner', 'Intermediate', 'Advanced'] as const;
export const courseStatus = ['Draft', 'Published', 'Archived'] as const;
export const courseCategories = [
    'Development',
    'Business',
    'Finance',
    'IT & Software',
    'Productivity',
    'Personal Development',
    'Design',
    'Marketing',
    'Health & Fitness',
    'Music',
    'Academics',
] as const;


export const courseSchema = z.object({
    title: z.string().min(3, {message: 'Title must be at least 3 character long'}).max(50, {message: 'Title must be less than 50 characters'}),
    description: z.string().min(3, {message: 'Description must be at least 3 character long'}).max(500, {message: 'Description must be less than 500'}),
    fileKey: z.string().min(1,{message: 'File is required'}),
    price: z.number().min(1, "Price should at least be $1"),
    duration: z.number().min(1, "Duration length should at least be 1 hr").max(500, "Duration must be less than 500 hrs"),
    level: z.enum(courseLevels, {message: 'Level is required'}),
    category: z.enum(courseCategories, {message: 'Category is required'} ),
    smallDescription: z.string().min(3, {message: 'Small-Description must be at least 3 character long'}).max(200, {message: 'Small-Description must be less than 200 character long'}),
    slug: z.string().min(3, {message: 'Slug must be at least 3 character long'}),
    status: z.enum(courseStatus, {message: 'Status is required'}),
})

export const chapterSchema = z.object({
    name: z.string().min(3, { message: "Name must be at least 3 character long" }),
    courseId: z.string().uuid({ message: "Invalid course id" }),
});

export const lessonSchema = z.object({
    name: z.string().min(3, { message: "Name must be at least 3 character long" }),
    courseId: z.string().uuid({ message: "Invalid course id" }),
    chapterId: z.string().uuid({ message: "Invalid chapter id" }),
    description: z.string().min(3, { message: "Description must be at least 3 character long" }).optional(),
    thumbnailKey: z.string().optional(),
    videoKey: z.string().optional(),
})



export type CourseSchemaType = z.infer<typeof courseSchema>;
export type LessonSchemaType = z.infer<typeof lessonSchema>;
export type ChapterSchemaType = z.infer<typeof chapterSchema>;
