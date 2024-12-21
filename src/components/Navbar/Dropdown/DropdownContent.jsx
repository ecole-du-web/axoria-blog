"use client";

import Link from "next/link";
import { logout } from "@/lib/serverActions/session/sessionMethods";
import { isPrivatePage } from "@/lib/server/session/utils";
export default function DropdownContent({ closeDropdown }) {

   async function handleLogout() {
    await logout(); // Appelle la Server Action pour supprimer la session
  
    const currentPath = window.location.pathname; // Chemin actuel de la page
    if (isPrivatePage(currentPath)) {
      window.location.href = "/signin"; // Redirige si sur une page privée
    } else {
      console.log("Vous êtes déconnecté.");
      
    }
  }


  return (
    <ul className="absolute right-0 top-10 w-[250px]">
      <li onClick={closeDropdown} className="bg-slate-50">
        <Link className="block p-4" href="/dashboard">
          Dashboard
        </Link>
      </li>
      <li className="bg-slate-50">
        <button
          onClick={handleLogout}
          className="block text-left w-full p-4"
          type="button"
        >
          Sign Out
        </button>
      </li>
    </ul>
  );
}
