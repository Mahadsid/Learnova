import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { tryCatch } from "@/hooks/try-catch";
import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteChapter } from "../actions";
import { toast } from "sonner";

export function DeleteChapter({ chapterId, courseId }: { chapterId: string; courseId: string; }) {


    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();

    async function onSubmit() {
        startTransition(async () => {
            const { data: result, error } = await tryCatch(deleteChapter({ chapterId, courseId }));

            if (error) {
                toast.error("An unexpected error occured. Please try again.")
            }
            if (result?.status === 'success') {
                toast.success(result.message);
                setOpen(false);
            } else if (result?.status === 'error') {
                toast.error(result.message);
            }
        });
        
    }

    return (
        //alert dialog bcz it dosent close on clicking outside the modal, it closes only when clicking the button showon on modal.
        <AlertDialog open={open} onOpenChange={setOpen} >
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Trash2 className="size-4"/>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent >
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure to delete this chapter?</AlertDialogTitle>
                    <AlertDialogDescription>Once deleted, action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button onClick={onSubmit} disabled={pending}>
                         {pending ? "Deleting..." : "Delete" }
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}