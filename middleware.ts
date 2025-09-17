/*
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);

    // THIS IS NOT SECURE!
    // This is the recommended approach to optimistically redirect users
    // We recommend handling auth checks in each page/route
	if (!sessionCookie) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/admindashboard/:path*"], // Specify the routes the middleware applies to
};
*/


/**
 * Since we want to apply arcjet bot protection, so that no AI bots can scrape our website for data, we use arcjet bot protection and we write in middleware so every request can be covered. and only searchengines to scrape for SEO.
 * read more on it here and its implementaion of code copied from: https://docs.arcjet.com/bot-protection/quick-start
 * And since we intercept bot detection in middleware we dont need to add it in all other server actions. can read more on above docs it is shown there so we remove bot detection from other files.
 */
import { env } from "@/lib/env";
import arcjet, { createMiddleware, detectBot } from "@arcjet/next";
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const aj = arcjet({
  key: env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    detectBot({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      // Block all bots except the following
      allow: [
		"CATEGORY:SEARCH_ENGINE",
		"CATEGORY:MONITOR",
		"CATEGORY:PREVIEW",
		// Google, Bing, etc
        // Uncomment to allow these other common bot categories
        // See the full list at https://arcjet.com/bot-list
        //"CATEGORY:MONITOR", // Uptime monitoring services
        //"CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
      ],
    }),
  ],
});

async function authMiddleware(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);

    // THIS IS NOT SECURE!
    // This is the recommended approach to optimistically redirect users
    // We recommend handling auth checks in each page/route
	if (!sessionCookie) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	return NextResponse.next();
}

export const config = {
  // matcher tells Next.js which routes to run the middleware on.
  // This runs the middleware on all routes except for static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};

// Pass any existing middleware with the optional existingMiddleware prop
export default createMiddleware(aj, async (request: NextRequest) => {
	if (request.nextUrl.pathname.startsWith("/admindashboard")) {
		return authMiddleware(request);
	}
	//this is needed for non admin routes, it will intercept the request but it will not make sure that user need to be authorized or authenticated.,  
	return NextResponse.next();
});



/**
 * Finally Completed the course Thank u so much
one problem on prod, stripe webhook is not working
on vercel it is giving 403 Forbidden error.
Solved now
use this
matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth|api/webhook/stripe).*)"],
actually arcjet was protecting your webhook route and thats why Forbidden error
 */