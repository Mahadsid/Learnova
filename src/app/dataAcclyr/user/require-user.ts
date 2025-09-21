import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

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