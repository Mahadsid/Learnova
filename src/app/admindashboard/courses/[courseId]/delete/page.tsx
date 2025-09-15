"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { tryCatch } from "@/hooks/try-catch";
import Link from "next/link";
import { useTransition } from "react";
import { DeleteCourse } from "./actions";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";


export default function DeleteCourseRoute() {

    const [pending, startTransition] = useTransition();
    const router = useRouter()

    //for getting course id for its deletion from the URL. this useParams hooks helps us to get params on client side.
    // just make sure <name should match the folder in here> <>.
    const  { courseId } = useParams<{courseId: string}>()
     
    function onSubmit() {
        startTransition(async () => {
            const { data: result, error } = await tryCatch(DeleteCourse(courseId));
            
            if (error) {
                // this checking for error failed in server side (server action, action.ts)
                toast.error("An unexpected error has occured. Please try again.");
                return;
            }

            if (result.status === "success") {
                toast.success(result.message);
                //since this is client side we use useRouter from and for navigation.
                router.push('/admindashboard/courses')
            } else if(result.status === "error") {
                toast.error(result.message)
            }
        })
    }

    return (
        <div className="max-w-xl mx-auto w-full">
            <Card className="mt-32">
                <CardHeader>
                    <CardTitle>Are you sure you want to delete this course?</CardTitle>
                    <CardDescription>This action cannot be undone.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <Link href="/admindashboard/courses" className={buttonVariants({variant: "outline"})}> Cancel
                    </Link>
                    <Button variant="destructive" onClick={onSubmit} disabled={pending}>
                        {
                            pending
                            ?
                            (   <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Deleting...
                                </>
                            )
                                :
                            (
                                <>
                                    <Trash2 className="size-4" />
                                    Delete
                                </>
                            )
                        }
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}