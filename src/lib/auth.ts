import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { env } from "./env";
import { emailOTP } from "better-auth/plugins"
import { resend } from "./resend";
import { admin } from "better-auth/plugins"

 
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    socialProviders: {
        github: {
            clientId: env.AUTH_GITHUB_CLIENT_ID,
            clientSecret: env.AUTH_GITHUB_CLIENT_SECRET
        },
    },
    plugins: [
        emailOTP({
            /**
             * implement sending email to user
             * we are going to use resend eamil for developers fo this check docs!
             */
            async sendVerificationOTP({ email, otp, type }) {
                if (type === 'sign-in') {
                    // Send OTP for sign in
                    await resend.emails.send({
                        from: 'Learnova <onboarding@resend.dev>',
                        to: [email],
                        subject: 'Learnova - Verify your email!',
                        html: `<p> Your OTP is <strong>${otp}<strong/></p>`,
                    });
                    
                } else if (type === "email-verification") {
                    // Send the OTP for email verification
                    
                } else {
                    // Send the OTP for password reset
                }
            },
        }),
        admin(),
    ],
});




