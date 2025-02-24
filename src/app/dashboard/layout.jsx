import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { sessionInfo } from "@/lib/server/session/sessionMethods"
export default async function Layout({ children }) {
  // Valider la session
  const {userId} = await sessionInfo()

  if (!userId) {
    redirect("/signin") // Redirige si la session est invalide
  }

  return <>{children}</>
}
