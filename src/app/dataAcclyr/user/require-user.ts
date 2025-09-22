import "server-only";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from 'react';


export const requireUser = cache(async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return redirect("/login")
    }

    return session.user;
});

/*
commenting this bcz we are implementing cache from react bcz we use reuireUser() in every user dataACClyr route so we do not need to get session every time and check it every time is user a admin or not, when we first time run requireUser() react can cache this and make less request to DB so we optimize performance. no code change just make arrow function and write the whole function inside cache().
we did same in requireAdmin() also.
++++++++++++++++++++++++++++++++++++++++++++++++++++
//this to check the session of the normal user, we created one silimiar for checking if the user is admin or not but this is for checking if the user is normal user and have valid session. bcz only logged in user with valid session can only do things like purchase course and enroll in it.
export async function requireUser() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return redirect("/login")
    }

    return session.user;
}
*/