"use client"
import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import { logout } from "@/lib/serverActions/session/sessionMethods"
import { isPrivatePage } from "@/lib/serverActions/session/utils"
import Link from "next/link"

export default function Dropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Fonction pour ouvrir ou fermer le dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  // Fonction pour fermer le dropdown
  const closeDropdown = () => {
    setIsOpen(false)
  }

  // Gestion du clic à l'extérieur du dropdown
  useEffect(() => {
    function handleClickOutside(event) {
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
    await logout() // Appelle la Server Action pour supprimer la session

    const currentPath = window.location.pathname // Chemin actuel de la page
    if (isPrivatePage(currentPath)) {
      window.location.href = "/signin" // Redirige si sur une page privée
    } else {
      console.log("Vous êtes déconnecté.")
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
