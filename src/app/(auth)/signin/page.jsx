"use client" // ??? DEFAULT ?
import { login } from "@/lib/actions/auth/auth.methods"
import { useRouter } from "next/navigation"

export default function page() {
  const router = useRouter()
  const handleSubmit = async e => {
    e.preventDefault()
    // errorRef.current.textContent = ''; // Reset error message

    const result = await login(new FormData(e.target))

    if (result.error) {
      // errorRef.current.textContent = result.error;
    } else if (result.success) {
      console.log("SUCCES", result)

      router.push("/") // Redirection en cas de succès
    }
  }
  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <label
        class="block text-gray-700 text-md font-semibold mb-2"
        for="username"
      >
        Pseudo + email à faire
      </label>
      <input
        class="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight mb-5 focus:outline-none focus:shadow-outline"
        id="username"
        type="text"
        name="username"
        placeholder="Name or pseudo"
      />

      <label
        class="block text-gray-700 text-md font-semibold mb-2"
        for="password"
      >
        Password
      </label>
      <input
        class="mb-10 shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        id="password"
        type="password"
        name="password"
        placeholder="Your password"
      />

      <button className="w-full self-end bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded border-none ">
        Submit
      </button>
    </form>
  )
}
