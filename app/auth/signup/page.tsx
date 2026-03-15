export const dynamic = "force-dynamic";

import { requireGuest } from "@/lib/auth/auth-server";
import SignupPage from "./_component";


export default async function Page() {

  await requireGuest();
  
  return (
   <>
    <SignupPage/>
   </>
  );
}

 