"use client"
import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import { logOut } from "@/lib/serverActions/session/sessionMethods"
import Link from "next/link"
import { useRouter } from "next/navigation"; // ✅ Utilisation du router Next.js
import { isPrivatePage } from "@/lib/serverActions/session/sessionMethods"
import { useAuth } from "@/app/AuthContext"
export default function Dropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const router = useRouter(); // ✅ Utilisation du router Next.js
  
  const {setIsAuthenticated} = useAuth()
  
  // Fonction pour ouvrir ou fermer le dropdown
  function toggleDropdown() {
    setIsOpen(!isOpen)
  }

  // Fonction pour fermer le dropdown
  function closeDropdown() {
    setIsOpen(false)
  }

  

  // Gestion du clic à l'extérieur du dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      // Si je suis en dehors du dd
      // Si je suis en dedans, soit je ne fais rien, soit j'ai cliqué sur le bouton pour le toggle
      if (!dropdownRef.current.contains(event.target)) {
        closeDropdown()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  async function handleLogout() {
    await logOut(); // Appelle la Server Action pour supprimer la session
  
    setIsAuthenticated({ loading: false, isConnected: false });
  
    const currentPath = window.location.pathname; // Chemin actuel de la page
    const isPrivate = await isPrivatePage(currentPath); // Attendre ici
  
    if (isPrivate) {
      router.push("/signin"); // ✅ Redirection fluide sans rechargement
    } else {
      console.log("Vous êtes déconnecté.");
    }
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={toggleDropdown}
        aria-label="toggle dropdown"
        className="flex" // pour le décalage d'image
      >
        <Image
          src="/icons/user.svg"
          alt="Ma super image"
          width={24}
          height={24}
        />
      </button>
      {isOpen && (
        <ul className="absolute right-0 top-10 w-[250px] border-b border-x border-b-zinc-300">
          <li
            onClick={closeDropdown}
            className="bg-slate-50 hover:bg-slate-200"
          >
            <Link className="block p-4" href="/dashboard">
              Dashboard
            </Link>
          </li>
          <li className="bg-slate-50 hover:bg-slate-200">
            <button
              onClick={handleLogout}
              className="block text-left w-full p-4"
              type="button"
            >
              Sign Out
            </button>
          </li>
        </ul>
      )}
    </div>
  )
}
