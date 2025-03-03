"use client"
import { usePathname } from "next/navigation";

export default function Loading() {
  const pathname = usePathname();

  // Ne pas afficher le loading sur une 404
  if (pathname.startsWith("/article/") && document.title === "404") {
    return null;
  }

  return (
    <div className="absolute top-0 w-full h-full z-50 inset-0 flex items-center justify-center">
      <span className="animate-spin w-14 h-14 mb-44 border-4 border-gray-300 border-t-blue-500 rounded-full"></span>
    </div>
  );
}
