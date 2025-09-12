
import { createAuthClient } from "better-auth/react"
import { emailOTPClient } from "better-auth/client/plugins"
import { adminClient } from "better-auth/client/plugins"


export const authClient = createAuthClient({
    plugins:[emailOTPClient(), adminClient()]
})

//auth client only works on client component! see bttrauh docs on Client Side on Use Session hook