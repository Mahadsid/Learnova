import { AdminCourseType } from "@/app/dataAcclyr/admin/admin-get-courses";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useConstructImageUrl } from "@/hooks/use-construct-image-url";
import { ArrowRight, Eye, MoreVertical, Pencil, School, TimerIcon, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";



/**
 * One way to create interface to get types for the data we are going to use is that we see what data and type we have and write here manually like id: string, title: string, etc.....
 * This is done most of the time and can also work here, but here the problem is if we get to more data to display then we have to add manually everywhere, it is not scalable there is no dynamically!
 * So to overcome this we use Awaited<Returntype<>> see in admin-get-course.ts file!
 * by using this even we get more data to display we only need to get it and type is automatically infered here! 
 */
interface iAppProps {
    data : AdminCourseType
}

export function AdminCourseCard({ data }: iAppProps) {
    const thumbnailUrl = useConstructImageUrl(data.fileKey)
    return (
        <Card className="group relative py-0 gap-0">
            {/* absolute dropdown */}
            <div className="absolute top-2 right-2 z-10">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon">
                            <MoreVertical className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        {/* EDIT COURSE */}
                        <DropdownMenuItem asChild>
                            <Link href={`/admindashboard/courses/${data.id}/edit`}>
                                <Pencil className="size-4 mr-2" />
                                Edit Course
                            </Link>
                        </DropdownMenuItem>
                        {/* PREVIEW COURSE */}
                        <DropdownMenuItem asChild>
                            <Link href={`/courses/${data.slug}`}>
                                <Eye className="size-4 mr-2" />
                                Preview
                            </Link>
                        </DropdownMenuItem>

                        {/* seperator */}
                        <DropdownMenuSeparator /> 
                        
                        {/* DELETE COURSE */}
                        <DropdownMenuItem asChild>
                            <Link href={`/admindashboard/courses/${data.id}/delete`}>
                                <Trash2 className="size-4 mr-2 text-destructive" />
                                Delete Course
                            </Link>
                        </DropdownMenuItem>
                        
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Thumbnail Image */}
            <Image src={thumbnailUrl} alt="Thumbnail url" width={600} height={400} className="w-full rounded-t-lg aspect-video h-full oject-cover" />
            
            {/* title */}
            <CardContent className="p-4">
                <Link href={`/admindashboard/courses/${data.id}/edit`}
                className="font-medium text-lg line-clamp-2 hover:underline group-hover:text-primary transition-colors"
                >
                    {data.title}
                </Link>

                {/* samll desc */}
                <p className="line-clamp-2 text-sm      text-muted-foreground leading-tight mt-2">
                    {data.smallDescription}
                </p>

                
                <div className="mt-4 flex items-center gap-x-5">
                    {/* duration */}
                    <div className="flex items-center gap-x-2">
                        <TimerIcon className="size-6 p-1 rounded-md text-primary bg-primary/10" />
                        <p className="text-sm text-muted-foreground">{data.duration}h</p>
                    </div>
                    {/* level */}
                    <div className="flex items-center gap-x-2">
                        <School className="size-6 p-1 rounded-md text-primary bg-primary/10" />
                        <p className="text-sm text-muted-foreground">{data.level}</p>
                    </div>
                </div>

                {/* Button to edit course */}
                <Link href={`/admindashboard/courses/${data.id}/edit`} className={buttonVariants({
                    className: "w-full mt-4"
                })}>
                    Edit Course <ArrowRight className="size-4" />
                </Link>
            </CardContent>
        </Card>
    )
}

