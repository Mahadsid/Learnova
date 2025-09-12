/**
 * if we have a client component then we cannot fetch data on the server side on this component, so thats a problem bcz we want to fetch the session on the server side for seeing if user is authenticated or not if yes user cannot access the login the page, so we need to fetch on server side!
 * SOLUTION -> create a seprate compnent for login form and render here and mark the component as a client component but itself should remain server component and we can fetch user session easily in this
 * we use _folderName bcz in nextjs it indicates a private folder and not be considered by the routing system.
 * it is also feature specific so we created it here in auth->login->_component bcz it is not going to resuse anywhere else
 */

import { auth } from "@/lib/auth";
import { LoginForm } from "./_components/LoginForm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (session) {
    return redirect("/") //redirect also works only on server component! on client we use useRouter hook!
  }
  return (
    <LoginForm />
  );
}
