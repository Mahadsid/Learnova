import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { lessonSchema, LessonSchemaType } from "@/lib/ZodSchema";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { tryCatch } from "@/hooks/try-catch";
import { createLesson } from "../actions";
import { toast } from "sonner";


export function NewLessonModal({courseId, chapterId}: {courseId: string, chapterId: string}) {
    const [isOpen, setIsOpen] = useState(false);
    const [pending, startTransition] = useTransition();

    //1. make form using zod, & define initial values: {from zod docs}
    const form = useForm<LessonSchemaType>({
        resolver: zodResolver(lessonSchema),
        defaultValues: {
            name: "",
            courseId: courseId,
            chapterId: chapterId,
        }
    });

    async function onSubmit(values: LessonSchemaType){
        startTransition(async () => {
            const { data: result, error } = await tryCatch(createLesson(values))
            //checkig server side errors/ that can come from actions file.
            if (error) {
                toast.error("An unexpected error occured. Please try again.");
                return
            }

            if (result?.status === 'success') {
                toast.success(result.message);

                form.reset();
                setIsOpen(false);
            } else if (result.status === 'error') {
                toast.error(result.message);
            }
        })
    }
    
    function handleOpenChange(open: boolean) {
        if (!open) { // when modal is closed we want to reset the form!
            form.reset()
        }
        setIsOpen(open);
    }
    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-center gap-1">
                    <Plus className="size-4"/> New Lesson
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Lesson</DialogTitle>
                    <DialogDescription>
                        Enter lesson name.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Lesson Name"  {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}>
                        </FormField>
                        <DialogFooter>
                            <Button type="submit" disabled={pending}>
                                {pending ? "Saving..." : "Save" } 
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>

            </DialogContent>
        </Dialog>
    )
}