"use client"
import Link from "next/link.js"
// import { sessionInfo } from "@/lib/server/session/sessionMethods"
import NavbarDropdown from "./NavbarDropdown"
import { useAuth } from "@/app/AuthContext"
import Image from "next/image"

export default function Navbar() {
  const { isAuthenticated } = useAuth()

  // console.log("kkkkkkkkk", isAuthenticated)

  return (
    <nav className=" w-full bg-slate-50 border-b border-b-zinc-300">
      <div className="relative max-w-6xl mx-auto flex py-4 px-12">
        <Link className="mr-2 text-zinc-900" href="/">
          AXORIA
        </Link>
        <Link className="mx-2 mr-auto text-zinc-900" href="/categories">
          Categories
        </Link>

        {isAuthenticated.loading && (
          <div
            className={
              "flex justify-center items-center transition-opacity-and-visibility"
            }
          >
            <Image src="/icons/loader.svg" width={24} height={24} alt="" />
          </div>
        )}
        {/* Loader avec transition */}

        {isAuthenticated.isConnected && (
          <>
            <Link className="mr-4 text-zinc-900" href="/dashboard/create">
              Add an article
            </Link>
            <NavbarDropdown userId={isAuthenticated.userId}/>
          </>
        )}

        {!isAuthenticated.isConnected && !isAuthenticated.loading && (
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
    </nav>
  )
}
