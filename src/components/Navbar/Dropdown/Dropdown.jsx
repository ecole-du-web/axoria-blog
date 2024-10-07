"use client"
import { useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { handleLogout } from "@/lib/actions/auth/auth.methods"

export default function Dropdown() {
  const dropdown = useRef(null) // Utilisation de useRef pour gérer l'erreur

  function toggleDropdown(e){
    console.log(dropdown.current);
    
    dropdown.current.classList.toggle("hidden")
  }

  return (
    <div className="relative">
      <button 
      onClick={toggleDropdown}
      aria-label="toggle dropdown"
      className="flex">
        {/*  flex Pour le petit décalage */}
        {/* aria-label ? Toggle ? */}
        {/* w et h obligatoires mais pas d'importance */}
        <Image
          src="/icons/user.svg"
          alt="Ma super image"
          width={24}
          height={24}
        />
      </button>
      <div ref={dropdown} className="absolute right-0 top-10 w-[250px]">
        <div className="bg-red-600">
          {/* ib pour le p-t */}
        <Link className="inline-block p-4" href="/">
          Dashboard
        </Link>
        </div>
        <div className="bg-red-600">
          <form action={handleLogout} className="p-4">
            <button type="submit">Sign Out</button>
          </form>
        </div>
      </div>
    </div>
  )
}
