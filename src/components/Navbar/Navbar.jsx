import Link from "next/link"
import Dropdown from "./Dropdown/Dropdown"
import { auth } from "@/lib/serverActions/auth/auth";
import Links from "./Links.jsx"
import { sessionInfo } from "@/lib/server/session/sessionMethods";
export default async function Navbar() {
  const session = await sessionInfo();
  console.log("NAVBAR", session);
  
  return (
    <nav className="relative w-full bg-slate-50 border-b border-b-zinc-300">
      <Links session={session}/>
    </nav>
  )
}
