import { cookies } from "next/headers"; // Pour accéder aux cookies dans un composant serveur
import { Session } from "@/lib/models/session";
import { User } from "@/lib/models/user";

export async function sessionInfo() {
  // Lire le cookie 'sessionId'
  const cookieStore = cookies();
  const sessionId = cookieStore.get("sessionId")?.value;

  if (!sessionId) {
    return null; // Pas de session, donc pas d'utilisateur connecté
  }

  // Vérifier la session dans la base de données
  const session = await Session.findById(sessionId);

  if (!session || session.expiresAt < new Date()) {
    return null; // Session invalide ou expirée
  }

  // Charger l'utilisateur lié à la session
  const user = await User.findById(session.userId);

  if (!user) {
    return null; // L'utilisateur n'existe plus
  }
  console.log("SESSION DU USER",user)

  // Retourner l'utilisateur connecté
  return user;
}


