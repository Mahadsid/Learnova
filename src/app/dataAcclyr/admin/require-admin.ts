import "server-only";
/**
 * Pseudo code/workflow
 * 1. get user session
 * 2. if(check for valid user session) else redirect
 * 3. if(check is user is admin), if yes -> return user
 * 4. else redirect
 */



import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function requireAdmin() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session) {
        return redirect("/login");
    }
    if (session.user.role !== "admin") {
        return redirect("/not-admin");
    }
    return session; //returnig valid session and user is admin
}