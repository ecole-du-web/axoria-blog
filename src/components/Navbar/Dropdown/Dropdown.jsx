"use client"
import { useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { handleLogout } from "@/lib/actions/auth/auth.methods"



export default  function Dropdown() {
  
  const dropdown = useRef(null) // Utilisation de useRef pour gérer l'erreur
  // Créer une feature qui enlève le dropdown quand on clique ailleurs.
  // surement avec un écouteur d'ev sur window qui s'auto enlève
  function toggleDropdown(e){
    console.log(dropdown.current);
    
    dropdown.current.classList.toggle("hidden")
  }

  // console.log(window); // erreur not definedne bloque pas le rendu car web api
  // console.log(abc); // erreur not defined bloque le rendu 
  // // ^qsdfpqsdfqs // erreur totale
  
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
      <div ref={dropdown} className="hidden absolute right-0 top-10 w-[250px]">
        <div className="bg-red-600">
          {/* ib pour le p-t */}
        <Link className="inline-block p-4" href="/dashboard">
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
