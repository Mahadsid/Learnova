
import { Badge } from "@/components/ui/badge";
import {  buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import Link from "next/link";
import { ArrowRight } from 'lucide-react';

// import { auth } from "@/lib/auth";
// import { headers } from "next/headers";

interface featureProps {
    title: string;
    description: string,
    icon: string,
}

const features : featureProps[] = [
    {
    title: "Comprehensive Courses",
    description:
      "Learn from a curated library of expert-led courses designed to match real-world skills.",
    icon: "📚",
  },
  {
    title: "Interactive Learning",
    description:
      "Stay engaged with hands-on exercises, quizzes, and assignments built for active learning.",
    icon: "🎮",
  },
  {
    title: "Progress Tracking",
    description:
      "Visualize your growth with smart analytics and a personalized learning dashboard.",
    icon: "📊",
  },
  {
    title: "Community Support",
    description:
      "Collaborate, share, and grow alongside a thriving community of learners.",
    icon: "👥",
  },
]


export default function Home() {
  /**
   * Bttrauth allows to access  user session natively on both server and client side. 
   * we commented the code bcz we want to use lib/auth-client for logout and it can only be used on client component, but getsession or user session is server side , so
   * first we make this as use client and then  use authClient.useSession().
   * bcz all the session thing like logout{clearing cookies and so...} is handled by bttrauth using auth-client for client side 
   */
  // const session = await auth.api.getSession({
  //   headers: await headers(),
  // })

//   const {
//     data: session,
//     // isPending, //loading state
//     // error, //error object
//     // refetch, //refetch the session
//     // we do'nt want other prpts only session this time!
//   } = authClient.useSession();

  

  return (
      <>
          {/*Hero Section*/}
          <section className="relative py-20">
              <div className="flex flex-col items-center text-center space-y-8">
                  <Badge variant="outline" className="text-2xl">Learn Smarter. Grow Faster. 🚀</Badge>
                  <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                        Transform the way you <span className="text-primary">learn</span>
                    </h1>
                  <p className="max-w-[700px] text-muted-foreground md:text-xl">Step into a modern,     interactive learning platform built for the future. High-quality courses, practical skills, and learning that fits your lifestyle.</p>
                  <div className="flex flex-col sm:flex-row gap-4 mt-8">
                      <Link href='/courses' className={buttonVariants({
                          size: "lg",
                      })}>Start Exploring <ArrowRight/> </Link>
                      <Link href='/login' className={buttonVariants({
                          size: "lg",
                          variant: "outline",
                      })}>Sign In</Link>
                  </div>
              </div>  
          </section>

          {/*Feature Section*/}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-32">
              {features.map((feature, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                          <div className="text-4xl mb-4">{feature.icon}</div>
                          <CardTitle>{ feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                          <p className="text-muted-foreground">{ feature.description }</p>
                      </CardContent>
                  </Card>
              ))}
          </section>
      </>
  );
}
