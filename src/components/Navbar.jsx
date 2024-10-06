"use server"
import Link from "next/link"
import { getServerSession } from "next-auth"
import nextAuthOptions from "@/lib/actions/auth/auth"

export default async function Navbar() {
  const session = await getServerSession(nextAuthOptions)

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
          {/* Si l'utilisateur est connecté, afficher le bouton Sign Out */}
          {session?.user ? (
            <div>
              <p>Welcome, {session.user.username || session.user.email}</p>
              <form action="/api/auth/signout" method="POST">
                <button type="submit">Sign Out</button>
              </form>
            </div>
          ) : (
            // Si l'utilisateur n'est pas connecté, afficher Sign In et Sign Up
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
