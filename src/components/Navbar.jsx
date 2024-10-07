"use server" 
import Link from "next/link"
import { auth } from "@/lib/actions/auth/auth"
import { handleLogout } from "@/lib/actions/auth/auth.methods"

export default async function Navbar() {
  
  const session = await auth()
  
  return (
    <nav className="w-full bg-slate-50 ">
      <div className="max-w-6xl mx-auto flex py-4 px-12 ">
        <Link className="mx-2" href="/">
          AXORIA
        </Link>
        <Link className="mx-2 mr-auto" href="/categories">
          Categories
        </Link>

        <div>
          {session?.user ? (
            <div>
              <p>Welcome, {session.user.username || session.user.email}</p>
              <form action={handleLogout} >
                <button type="submit">Sign Out</button>
              </form>
            </div>
          ) : (
            <>
              <Link className="mx-2" href="/signin">
                Sign In
              </Link>
              <Link className="mx-2" href="/signup">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
