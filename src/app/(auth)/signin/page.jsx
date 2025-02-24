"use client"
// import { login } from "@/lib/actions/auth/auth.methods"
import { login } from "@/lib/serverActions/session/sessionMethods"
import { useRouter } from "next/navigation"
import { useRef } from "react"
import { useAuth } from "@/app/AuthContext"

export default function Page() {
  const router = useRouter()
  const serverInfoRef = useRef()
  const submitButtonRef = useRef(null)

  const {setIsAuthenticated} = useAuth()

  async function handleSubmit(e) {


    e.preventDefault()
    serverInfoRef.current.textContent = "" // reset d'un potentiel message

    submitButtonRef.current.disabled = true
    try {
      const result = await login(new FormData(e.target))

      if (result.success) {
        setIsAuthenticated({ loading: false, isConnected: true })
        router.push("/") // Redirige vers la page d'accueil si succès
      }
    } catch (err) {
      console.error("Error during login:", err)
      submitButtonRef.current.disabled = false
      serverInfoRef.current.textContent = err.message
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-20">
      <label
        className="block text-gray-700 text-md font-semibold mb-2"
        htmlFor="userName"
      >
        Your pseudo or email
      </label>
      <input
        className="shadow appearance-none border rounded w-full py-3 px-3 mb-5 text-gray-700 leading-tight  focus:outline-none focus:shadow-outline"
        id="userName"
        type="text"
        name="userName"
        required
        placeholder="Name or pseudo"
      />

      <label
        className="block text-gray-700 text-md font-semibold mb-2"
        htmlFor="password"
      >
        Your password
      </label>
      <input
        className=" shadow appearance-none border rounded w-full py-3 px-3 mb-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        id="password"
        type="password"
        name="password"
        required
        placeholder="Your password"
      />

      <button
        ref={submitButtonRef}
        className="w-full self-end bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-3 px-4 mb-3 rounded border-none "
      >
        Submit
      </button>
      <p ref={serverInfoRef} className="text-red-600 mt-2"></p>
    </form>
  )
}
