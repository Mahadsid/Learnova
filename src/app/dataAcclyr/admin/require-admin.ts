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
import { cache } from "react";

export const requireAdmin = cache(async () => {
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
})


/*
commenting this bcz we are implementing cache from react bcz we use reuireAdmin() in every admin dataACClyr route so we do not need to get session every time and check it every time is user a admin or not, when we first time run requireAdmin() react can cache this and make less request to DB so we optimize performance. no code change just make arrow function and write the whole function inside cache().
we did same in requireUser() also. 
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
*/