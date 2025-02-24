"use client"
import { useRef } from "react"
import { useRouter } from "next/navigation"
import { register } from "@/lib/serverActions/session/sessionMethods"

export default function SignupPage() {
  const serverInfoRef = useRef(null) // Utilisation de useRef pour gérer l'erreur
  const submitButtonRef = useRef(null)

  async function handleSubmit(e) {
    e.preventDefault()
    serverInfoRef.current.textContent = "" // Reset error message

    submitButtonRef.current.textContent = "Saving User..."
    submitButtonRef.current.disabled = true
    try {
      const result = await register(new FormData(e.target))

      if (result.success) {
        submitButtonRef.current.textContent = "User created ✅"
        serverInfoRef.current.style.color = "#111"
        // Optionnel : redirection ou affichage de succès ici
        let countdown = 3 // Le nombre de secondes avant redirection
        serverInfoRef.current.textContent = `Redirecting in ${countdown}...`
        const interval = setInterval(() => {
          countdown -= 1
          serverInfoRef.current.textContent = `Redirecting in ${countdown}...`

          if (countdown === 0) {
            clearInterval(interval) // Arrête l'intervalle
            window.location.href = "/signin" // fonctionne mieux que router.push("/") dans ce cas. C'est next auth qui foire anyway mais avec le rsc pas de recharge de toute façon ?
          }
        }, 1000) // Met à jour toutes les secondes (1000 ms)
      }
    } catch (error) {
      submitButtonRef.current.textContent = "Submit"
      submitButtonRef.current.disabled = false
      serverInfoRef.current.textContent = error.message // erreur fournie par throw new Error
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-20">
      <label
        className="block text-gray-700 text-md font-semibold mb-2"
        htmlFor="userName"
      >
        Name or pseudo
      </label>
      <input
        className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight mb-5 focus:outline-none focus:shadow-outline"
        id="userName"
        name="userName" // Ajout de name ici
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
      {/* Affiche l'erreur ici */}
      <button
        type="submit"
        ref={submitButtonRef}
        className="w-full self-end bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-3 px-4 mb-10 rounded border-none"
      >
        Submit
      </button>
      <a href="/signin" className="mb-5 underline text-blue-600 block text-center">Already have an account ? Log in</a>
      <p ref={serverInfoRef}></p>
    </form>
  )
}
