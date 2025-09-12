
import { env } from '@/lib/env';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import z from 'zod';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner'
import { S3 } from '@/lib/S3Client';
import arcjet, { detectBot, fixedWindow } from '@/lib/arcjet';
import { requireAdmin } from '@/app/dataAcclyr/admin/require-admin';

//for type safety we make schema
export const fileUploadSchema = z.object({
    fileName: z.string().min(1, {message: "Filename is required"}),
    contentType: z.string().min(1, {message: "Content type is required"}), 
    size: z.number().min(1, { message: "Size is required" }), 
    isImage: z.boolean(),
})

// securing api with arcjet, configurating it
const aj = arcjet.withRule(
    detectBot({
        mode: "LIVE",
        allow: [],
    })
).withRule(
    fixedWindow({
        mode: "LIVE",
        window: "1m",
        max: 5,
    })
);


//packages intalled for S3, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner

export async function POST(request: Request) {
    // const session = await auth.api.getSession({
    //     headers: await headers(),
    // }); THIS IS COMMENTED BCZ:since we make general file for checking session plus checking for user | admin we use new code below and commented this!
    const session = await requireAdmin();
    try {

        // arcjet protection : passing the request to arcjet
        //firstly arcjet validate the request then only we move forward with the below code, this require two things first the request 2. is something unique to track the request (remember fingerprint waht we added in lib/arcjet.ts)! so for this uniuqe we are going to use session id!
        const decision = await aj.protect(request, { fingerprint: session?.user.id as string, })
        if (decision.isDenied()) {
            return NextResponse.json(
                { error: "Dont try to fuzz my API!" },
                { status: 429 }
            );
        }


        //1. getting file from body
        const body = await request.json();
        //2. validating through parsing it against our Schema
        const validation = fileUploadSchema.safeParse(body);
        //3. check for seeing validation is true or not
        if (!validation.success) {
            return NextResponse.json(
                { error: "Invalid Request" },
                { status: 400 },
            );
        }
        //4. if validation passed we get our data
        const { fileName, contentType, size } = validation.data;

        //5. generating s3 bucket presigned URL, but first
        // 5a. use putobjectcommand to specify our file details/ content, then 
        // 5b. find or define bucket on which file is need to store/upload,  
        //5c generate unique key, content type, content.
        //then this object is passed to s3 or presigned url for verification.
        
        const uniqueKey = `${uuidv4()}-${fileName}`
        
        const command = new PutObjectCommand({
            Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME,
            ContentType: contentType,
            ContentLength: size,
            Key: uniqueKey,
        });
        // presigned url creation using getsigned function requires 3 args (S3 client, putobjectcommand, expiration time )
        const presignedUrl = await getSignedUrl(S3, command, {
            expiresIn: 360, //url expires in 6 mins or  '3 hundred 60 secs'
        });

        const response = {
            presignedUrl,
            key: uniqueKey,
        }
        return NextResponse.json(response);

    } catch {
        return NextResponse.json(
            { error: "Failed to generate presigned URL" },
            { status: 500 },
        )
    }
}