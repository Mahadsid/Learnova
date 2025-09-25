import Link from "next/link";
import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t py-6 mt-12">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        {/* Left: Logo / Rights */}
        <div className="flex flex-col items-center md:items-start">
          <span className="font-semibold text-primary">Learnova🌌</span>
          <span>© {new Date().getFullYear()} All rights reserved.</span>
        </div>

        {/* Center: Made by */}
        <div>
          Made with ❤️ by <span className="font-medium">Muhammad Mahad</span>
        </div>

        {/* Right: GitHub link */}
        <div>
          <Link
            href="https://github.com/Mahadsid"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            <Github className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
