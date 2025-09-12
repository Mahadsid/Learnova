import { env } from "@/lib/env"

export function useConstructImageUrl(key: string) : string {
    return `https://${env.NEXT_PUBLIC_S3_BUCKET_NAME}.t3.storage.dev/${key}`;
}
