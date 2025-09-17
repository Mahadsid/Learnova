import {
  BookOpen,
  ChevronDownIcon,
  Home,
  LayoutDashboardIcon,
  LogOutIcon,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

interface userDropDownProps {
    name: string,
    email: string,
    image: string,
}

export function UserDropdown({name, email, image}: userDropDownProps) {
    //See for client we use router from useRouter, for server side we use redirect().
  const router = useRouter();
  //signout func from bttrauth
  //after sometime due to repetion of signout function we created a hook for it, see in hook folder,
  // see its implementation in nav-user component at end of the code it is used and initilzed at above in code. i will leave the below signout as it is, but we can also use its hook here also!
  async function signOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          toast.success("SignOut Successfully")
            },
            onError: () => {
              toast.error('SignOut Failed')
          }
      }
    })
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
          <Avatar>
            <AvatarImage src={image} alt="Profile image" />
                      <AvatarFallback>{ email.charAt(0).toUpperCase() }</AvatarFallback>
          </Avatar>
          <ChevronDownIcon
            size={16}
            className="opacity-60"
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className="min-w-44">
        <DropdownMenuLabel className="flex min-w-0 flex-col">
          <span className="text-foreground truncate text-sm font-medium"> 
            {name ? name : email.split('@')[0]}
          </span>
          <span className="text-muted-foreground truncate text-xs font-normal">
            {email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
                      <Link href='/'>
                          <Home size={16} className="opacity-60" aria-hidden="true" />
            <span>Home</span>
                      </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
                      <Link href='/courses'>
                          <BookOpen size={16} className="opacity-60" aria-hidden="true" />
            <span>Courses</span>
                      </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild> 
                      <Link href='/admindashboard'>
                          <LayoutDashboardIcon size={16} className="opacity-60" aria-hidden="true" />
            <span>Dashboard</span>
                      </Link>
          </DropdownMenuItem>
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator />
              
        <DropdownMenuItem onClick={signOut}>
          <LogOutIcon size={16} className="opacity-60" aria-hidden="true" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
