import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { validateSession } from "@/lib/server/session/sessionMethods"

export default async function RootLayout({ children }) {
  // Récupérer le cookie de session
  const cookieStore = cookies()
  const sessionId = cookieStore.get("sessionId")?.value

  // Valider la session
  const userId = await validateSession(sessionId)

  if (!userId) {
    redirect("/signin") // Redirige si la session est invalide
  }

  return <>{children}</>
}
