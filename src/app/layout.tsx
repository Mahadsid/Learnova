import type { Metadata } from "next";
import { Geist_Mono} from "next/font/google"; // keep for monospace
import "./globals.css";

import { ConsentManagerProvider, CookieBanner, ConsentManagerDialog } from "@c15t/nextjs";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/sonner";

// Import Roboto with ALL weights

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Learnova🌌",
  description: "Learnova LMS Modern Learning Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        <html lang="en" suppressHydrationWarning>
          <body
            // robota added 
            className={`$ ${geistMono.variable} antialiased`}
            >
            {/* Consent Manager */}
    		    <ConsentManagerProvider options={{
    					mode: 'c15t',
    					backendURL: '/api/c15t',
    					consentCategories: ['necessary', 'marketing'], // Optional: Specify which consent categories to show in the banner. 
    					ignoreGeoLocation: true, // Useful for development to always view the banner.
            }}>
            <CookieBanner />
    			  <ConsentManagerDialog />
    			
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
            {children}
            <Toaster position="top-center"/>
            </ThemeProvider>
                
    		    </ConsentManagerProvider>
    	    </body>
        </html>
      )
}
