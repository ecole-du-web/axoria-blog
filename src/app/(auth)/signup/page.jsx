"use client"
import { register } from "@/lib/actions/auth/auth.methods"
import { useRef } from "react"
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const errorRef = useRef(null) // Utilisation de useRef pour gérer l'erreur
  const router = useRouter()

  const handleSubmit = async e => {
    e.preventDefault()
    errorRef.current.textContent = "" // Reset error message
    console.log(new FormData(e.target));
    console.log(e.target);

    for (const [key, value] of new FormData(e.target).entries()) {
      console.log(key, value);
    }
    
    const result = await register(new FormData(e.target))

    if (result.error) {
      errorRef.current.textContent = result.error
    } else if (result.success) {
      router.push("/") // Redirection en cas de succès
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <label
        className="block text-gray-700 text-md font-semibold mb-2"
        htmlFor="username"
      >
        Name or pseudo
      </label>
      <input
        className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight mb-5 focus:outline-none focus:shadow-outline"
        id="username"
        name="username" // Ajout de name ici
        type="text"
        placeholder="Name or pseudo"
        required
      />
      <label
        className="block text-gray-700 text-md font-semibold mb-2"
        htmlFor="email"
      >
        E-mail
      </label>
      <input
        className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight mb-5 focus:outline-none focus:shadow-outline"
        id="email"
        name="email" // Ajout de name ici
        type="email"
        placeholder="E-mail"
        required
      />
      <label
        className="block text-gray-700 text-md font-semibold mb-2"
        htmlFor="password"
      >
        Password
      </label>
      <input
        className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight mb-5 focus:outline-none focus:shadow-outline"
        id="password"
        name="password" // Ajout de name ici
        type="password"
        placeholder="Your password"
        required
      />
      <label
        className="block text-gray-700 text-md font-semibold mb-2"
        htmlFor="passwordRepeat"
      >
        Confirm password
      </label>
      <input
        className="mb-14 shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        id="passwordRepeat"
        name="passwordRepeat" // Ajout de name ici
        type="password"
        placeholder="Confirm password"
        required
      />
      <p ref={errorRef} className="text-red-500 mb-4"></p>{" "}
      {/* Affiche l'erreur ici */}
      <button
        type="submit"
        className="w-full self-end bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded border-none"
      >
        Submit
      </button>
    </form>
  )
}
