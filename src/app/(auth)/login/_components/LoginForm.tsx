"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { Loader } from "lucide-react";
import {  useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import UseAnimations from "react-useanimations";
import github from "react-useanimations/lib/github";
import { toast } from "sonner";

export function LoginForm() {
  const router = useRouter()//bcz client, redirect for server!

  const [email, setEmail] = useState("")
  /**
   * for keep tracking of email feild & setting email for sending it in url!
   */

    const [isGithubPending, startGithubTransition] = useTransition() 
  /**
   * for pending state we can use useState but
   * useTransitoin lets you render a part of the UI in the background!
   * it can be used to show a pending state, the code runs inside the transition method, when the tansition is pending the pending boolean is set to true.
   * why use this instead of useState: it can be used to revalidate  path function, this can validateour cache.
   */

  async function signInWithGithub() {
    /**
     * Using betterauth signIn not signup for github bcz github is an oauth provider which provide only signin user, also using signin we can use social property with signup we can use only email to signup.
     * provider -> which party, more parties check on betterauth docs.
     *  callbackurl -> after successfull login where to redirect.
     * fetchotions -> this we can listen to events like onSuccess or onError
     */
    startGithubTransition(async () => {
      await authClient.signIn.social({
      provider: 'github',
      callbackURL: "/",
      fetchOptions: {
        onSuccess: () => {
          toast.success("Successfully signed in with Github!")
        },
        onError: () => {
          toast.error("Server error")
        }
      }
    })
    })
  }
  //same as above signin with github functionality
  const [emailPending, startEmailTransition] = useTransition();
  function signInWithEmail() {
    startEmailTransition(
      async () => {
        await authClient.emailOtp.sendVerificationOtp({
          email: email,
          type: 'sign-in',
          fetchOptions: {
            onSuccess: () => {
              toast.success('Email Sent')
              router.push(`/verify-request?email=${email}`)
              //name should match your api route, in my case its (auth)/verify-request
              //also adding email to this url so this can used to verify otp from the api route.
            },
            onError: () => {
              toast.error('Error sending email')
            }
          }
        })
      }
    )
  }



    return (
        <Card className="w-full max-w-sm shadow-sm rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
      <CardHeader className="space-y-2 text-center">
        {/* Title */}
        <CardTitle className="text-2xl font-bold tracking-tight text-black dark:text-white">
          Welcome
        </CardTitle>
        <CardDescription className="text-sm text-neutral-500 dark:text-neutral-400">
          Login with your account
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* Github Login Button */}
        <Button
          className="w-full flex items-center gap-2 rounded-lg font-medium text-black dark:text-white border-neutral-300 dark:border-neutral-700"
          variant="outline"
          onClick={signInWithGithub}
          disabled={isGithubPending}
        >
          {
            isGithubPending ?
            <>
              <Loader className="size-4 animate-spin" />
              <span>Loading...</span>
            </>
            :
            <>
              <UseAnimations animation={github} className="size-5" strokeColor="currentColor" />
              Sign in with Github
            </>
          }
        </Button>

        {/* Divider */}
        <div className="relative flex items-center">
          <div className="w-full border-t border-neutral-200 dark:border-neutral-700" />
          <span className="absolute left-1/2 -translate-x-1/2 bg-white dark:bg-neutral-900 px-3 text-xs text-neutral-400 dark:text-neutral-500">
            or continue with
          </span>
        </div>

        {/* Email login */}
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-black dark:text-white"
            >
              Email
            </Label>
              <Input
                onChange={(e) => setEmail(e.target.value)}
                required
              type="email"
              placeholder="name@example.com"
              className="rounded-lg border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:border-black dark:focus:border-white focus:ring-0"
            />
          </div>
            <Button className="w-full rounded-lg font-medium bg-black text-white dark:bg-white dark:text-black"
              onClick={signInWithEmail}
              disabled={emailPending}
            >
              {
                emailPending ?
                  <>
                    <Loader className="size-4 animate-spin" />
                    <span>Loading...</span>
                  </>
                  :
                  <>
                    <span>Continue with Email</span>
                  </>
                  }
          </Button>
        </div>
      </CardContent>
    </Card>
    );
}