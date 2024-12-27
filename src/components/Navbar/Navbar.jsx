import Link from "next/link.js"
import { sessionInfo } from "@/lib/server/session/sessionMethods"
import NavbarDropdown from "./NavbarDropdown"

export default async function Navbar() {
  const session = await sessionInfo()

  return (
    <nav className="relative w-full bg-slate-50 border-b border-b-zinc-300">
      <div className="max-w-6xl mx-auto flex py-4 px-12 ">
        <Link className="mx-2 text-zinc-900" href="/">
          AXORIA
        </Link>
        <Link className="mx-2 mr-auto text-zinc-900" href="/categories">
          Categories
        </Link>
        {session && (
          <Link className="mr-4 text-zinc-900" href="/dashboard/create">
            Add an article
          </Link>
        )}
        <div>
          {session ? (
            <NavbarDropdown />
          ) : (
            <>
              <Link className="mx-2 text-zinc-900" href="/signin">
                Sign In
              </Link>
              <Link className="mx-2 text-zinc-900" href="/signup">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
