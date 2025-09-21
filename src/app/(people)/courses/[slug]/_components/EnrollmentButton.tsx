"use client";

import { Button } from "@/components/ui/button";
import { tryCatch } from "@/hooks/try-catch";
import { useTransition } from "react";
import { enrollInCourse } from "../actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function EnrollmentButton({courseId} : {courseId: string}) {

    const [pending, startTransition] = useTransition();

    function onSubmit() {
        // do something with form values
        // console.log(values);

        startTransition(async () => {
            const { data: result, error } = await tryCatch(enrollInCourse(courseId));
            
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
        <Button className="w-full" onClick={onSubmit} disabled={pending}>
            {
                pending
                    ?
                    <>
                        <Loader2 className="size-4 animate-spin" />
                        Loading...
                    </>
                    :
                    <>
                        Enroll Now
                    </>
            }
        </Button>
    )
}