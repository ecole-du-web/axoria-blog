"use client"
import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import DropdownContent from "./DropdownContent"
export default function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fonction pour ouvrir ou fermer le dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Fonction pour fermer le dropdown
  const closeDropdown = () => {
    setIsOpen(false);
  };

  // Gestion du clic à l'extérieur du dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  return (
    <div ref={dropdownRef}  className="relative">
      <button
        onClick={toggleDropdown}
        aria-label="toggle dropdown"
        className="flex"
      >
        <Image
          src="/icons/user.svg"
          alt="Ma super image"
          width={24}
          height={24}
        />
      </button>
      {isOpen && <DropdownContent closeDropdown={closeDropdown} />}
    </div>
  )
}
