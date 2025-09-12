"use client";

import { useCallback, useEffect, useState } from 'react';
import { FileRejection, useDropzone } from 'react-dropzone'
import { Card, CardContent } from '../ui/card';
import { cn } from '@/lib/utils';
import { RenderEmptyState, RenderErrorState, RenderUploadedState, RenderUploadingState } from './RenderState';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { useConstructImageUrl } from '@/hooks/use-construct-image-url';



// see docs here https://react-dropzone.js.org/

interface UploaderState { 
    id: string | null;
    file: File | null;
    uploading: boolean;
    progress: number;
    key?: string;
    isDeleting: boolean;
    error: boolean;
    objectUrl?: string;
    fileType: "image" | "video";
}

// for the UI page.tsx, for setting form onChange and value.
interface iAppProps {
    value?: string;
    onChange?: (value: string) => void;
}

export function Uploader({ onChange, value }: iAppProps) {
    //since we need to display image in edit form in edit course, we need objectUrl, so need to constructURL which we will use or hook and use it here!
    const fileUrl = useConstructImageUrl(value || '')

    const [fileState, setFileState] = useState<UploaderState>({
        error: false,
        file: null,
        id: null,
        uploading: false,
        progress: 0,
        isDeleting: false,
        fileType: "image",
        key: value,
        objectUrl: fileUrl,
    });

    async function uploadFile(file: File) {
        setFileState((prev) => (
            {
                ...prev,
                uploading: true,
                progress: 0,
            }
        ))

        try {
            // 1.get presigned url (from route we created for it before)
            const presignedResponse = await fetch('/api/s3/upload', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    //property name should match in the route.(check its route code)
                    fileName: file.name,
                    contentType: file.type,
                    size: file.size,
                    isImage: true,
                }),
            });
            // defensive coding, checking if presigned url response failed
            if (!presignedResponse.ok) {
                toast.error("Failed to get presigned URL");
                // so updating state according to failed 
                setFileState((prev) => (
                    {
                        ...prev,
                        uploading: false,
                        progress: 0,
                        error: true,
                    }));
                //do not continue, so also return it!
                return;
            }

            // so here presigned response is succesfull we get presigned url and a key bcz this is what we returned in route.
            const { presignedUrl, key} = await presignedResponse.json();

            // now we can use this presigned url to upload our file
            // also we will use XMLHttpRequest (XHR), it is used to interact with servers, can extract data from URL without having to do full page refresh plus update part of webpage without disturbing what user is doing {this is what we need for tracking progress} ! fetch cannot do that, axios can do that but for only using here not using extra package.
            
            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                //we use it to listen events specifically onProgress envent!
                xhr.upload.onprogress = (event) => {
                    // calc how much file is uploaded
                    if (event.lengthComputable) {
                        const percentageCompleted = (event.loaded / event.total) * 100
                        //setting progress in state!
                        setFileState((prev) => (
                            {
                                ...prev,
                                progress: Math.round(percentageCompleted),
                            }
                        ));
                    }
                }
                //checking if xhr was succesful in uploading file or not
                xhr.onload = () => {
                    // 200 or 204 statuses means succesful
                    if (xhr.status === 200 || 204) {
                        setFileState((prev) => (
                            {
                                ...prev,
                                progress: 100,
                                uploading: false, //file is not uploading anymore, i.e false
                                key: key,
                            }
                        ));

                        //saving key, so for form onChange we save our key, (done later)
                        onChange?.(key);

                        toast.success("File uploaded successfully!")
                        resolve()
                    } else {
                        reject(new Error('Upload failed!'))
                    }
                };
                // when xhr not successful or error do this
                xhr.onerror = () => {
                    reject(new Error("Upload Failed"));
                };
                //finally we can open/configure our request and send file, 1. arg = method is PUT 2.arg destination/server url
                xhr.open('PUT', presignedUrl);
                //content type for this request is our file type
                xhr.setRequestHeader("Content-Type", file.type);
                // sending request arg = body, & our body is file.
                xhr.send(file);
            });
        } catch  {
            toast.error('Something went wrong');
            setFileState((prev) => (
                {
                    ...prev,
                    uploading: false,
                    progress: 0,
                    error: true,
                }
            ));
        }
    }

    const onDrop = useCallback((acceptedFiles : File[]) => {
        // Do something with the files
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];

            //we revoke objectUrl when we dropped the file in drop zone
            if (fileState.objectUrl && !fileState.objectUrl.startsWith("http")) {
                URL.revokeObjectURL(fileState.objectUrl)
            }

            setFileState({
                file: file,
                uploading: false,
                progress: 0,
                objectUrl: URL.createObjectURL(file),
                error: false,
                id: uuidv4(),
                isDeleting: false,
                fileType: "image",
            });
            //calling upload file function & passinf the file we recieved!
            uploadFile(file);
        }
    }, [fileState.objectUrl])

    // Also removing file or file cleanup
    async function handleRemoveFile() {
        //if we are deleting a file or if we dont have objecturl we return it simply!
        if (fileState.isDeleting || !fileState.objectUrl) return;
        try {
            //setting deleting to true in state
            setFileState((prev) => ({
                ...prev,
                isDeleting: true,
            }))
            // making request to the route for deleting the file.
            const response = await fetch('/api/s3/delete', {
                method: 'DELETE',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    //sending key in body
                    key: fileState.key,
                }),
            });
            //defensecode on response
            if (!response.ok) {
                toast.error("Failed to delete file form storage.")
                //seting state also
                setFileState((prev) => ({
                    ...prev,
                    isDeleting: true,
                    error: true,
                }))
                return;
            }
            //since now we deleted the file we also need to clean up the objectUrl
            if (fileState.objectUrl && !fileState.objectUrl.startsWith("http")) {
                URL.revokeObjectURL(fileState.objectUrl)
            }
            
            // (done later for form) here also when removing file we set onChange of form
            onChange?.("") // since we deleted the file there is no key so setting it to empty
            
            //again set file state now here since all is good and successful
            setFileState(() => ({
                file: null,
                uploading: false,
                progress: 0,
                objectUrl: undefined,
                error: false,
                fileType: "image",
                id: null,
                isDeleting: false,
            }));
            toast.success("File deleted successfully!")
        } catch {
            toast.error("Error deleting file, please try again later!")
            setFileState((prev) => ({
                ...prev,
                isDeleting: false,
                error: true,
            }));
        }
    }

    function rejectedFiles(fileRejection: FileRejection[]) { 
        if (fileRejection.length) {
            const tooManyFiles = fileRejection.find((rejection) => rejection.errors[0].code === 'too-many-files')
            if (tooManyFiles) {
                toast.error('Too many files selected, select 1 only')
            }

            const fileSizeTooBig = fileRejection.find((rejection) => rejection.errors[0].code === 'file-too-large')
            if (fileSizeTooBig) {
                toast.error('File size is too large, max allowed 5 Mb')
            }
        }
    }

    //creting function for bettering UI, with progress and other properties we created!! and show the states we created in RenderState.ts file
    function renderContent() {
        if (fileState.uploading) {
            return <RenderUploadingState file={fileState.file as File} progress={fileState.progress} />
        }
        if (fileState.error) {
            return <RenderErrorState />
        }
        if (fileState.objectUrl) {
            return <RenderUploadedState previewUrl={fileState.objectUrl} handleRemoveFile={handleRemoveFile} isDeleting={fileState.isDeleting} />
        }
        return <RenderEmptyState isDragActive={isDragActive} />
    } 

    //also cleanup or revoking objectUrl if our component is ummounted
    useEffect(() => {
        return () => {
            if (fileState.objectUrl && !fileState.objectUrl.startsWith("http")) {
                URL.revokeObjectURL(fileState.objectUrl)
            }
        }
    }, [fileState.objectUrl]);
    
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/*": []
        },
        maxFiles: 1,
        multiple: false,
        maxSize: 5 * 1024 * 1024, //5Mb
        onDropRejected: rejectedFiles,
        //we disable since the dropzone or browse open automatically when we delete file, so need it to use disable property
        disabled: fileState.uploading || !!fileState.objectUrl, //the !! convert it to boolean since object url is string so we can work it out on condition
    })

     return (
    <Card {...getRootProps()} className={cn("relative border-2 border-dashed transition-colors duration-200 ease-in-out w-full h-64", isDragActive ? "border-primary bg-primary/10 border-solid" : "border-border hover:border-primary" )}>
        <CardContent className='felx items-center justify-center h-full w-full p-4'>
            <input {...getInputProps()} />
            {renderContent()}
        </CardContent>
    </Card>
  )
}

/**
 * NOTE: ABOUT IMPLEMENTATION OF THIS FEATURE (UPLOADING TO S3)
 * where do we define our objectUrl? -> WE DEFINE IT IN OUR onDrop function and inside STATE, in another way
 *  we can also do it bleow like around renderContent(), create objecturl and pass the file there, that will also create the objecturl & thats a !!!!MISTAKE!!!!
 * Since we implement progress tracking so as progress updates the number, the content re-Renders 100 times, so to create objectURL there, then we would create this url 100 times !!!
 * SO by defining it in state above we create it once and thats it.
 * ANOTHER CAVEAT: the objectURL creates URL but where it is stored? -> In memory, so if we give user to upload 1 billion images & and dont clean up these URLs so we suffers from !!!memoryleak!!!.
 * So when once file is uploaded, maybe later deleted, or not used anymore we want to revoke this objectUrl.
 * we don this two time see above in onDrop function and in useEffect callback!.
 */