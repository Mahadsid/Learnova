import { requireAdmin } from "@/app/dataAcclyr/admin/require-admin";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { env } from "@/lib/env";
import { S3 } from "@/lib/S3Client";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";


// securing api with arcjet, configurating it
const aj = arcjet
//     .withRule(
//     detectBot({
//         mode: "LIVE",
//         allow: [],
//     })
// ) we-commented or can delete this bcz we implemented detectbot in middleware so it intercept bot at every request no need to deifne it here again! read docs to read docs see middleware.ts file more info there.
    .withRule(
    fixedWindow({
        mode: "LIVE",
        window: "1m",
        max: 5,
    })
);


export async function DELETE(request: Request) {
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

        // 1. getting the key from body
        const body = await request.json();
        // 2. to delete the file we need unique identifier which is our key in S3.
        const key = body.key;
        //defensecode
        if (!key) {
            return NextResponse.json(
                { error: "Missing or invalid object key" },
                {status: 400},
            )
        }
        // 3. crete a delete command just like we did when uploading to s3, and send/call it to S3CLIENT. 
        const command = new DeleteObjectCommand({
            Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME,
            Key: key,
        });
        await S3.send(command);

        // 4. returning response after succesfully deleting file
        return NextResponse.json(
            { message: "File deleted successfully" },
            {status: 200},
        )
    } catch  {
        return NextResponse.json(
                { error: "Missing or invalid object key" },
                {status: 500}
            )
    }
}