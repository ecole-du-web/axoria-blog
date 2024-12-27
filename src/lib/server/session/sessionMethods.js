import { cookies } from "next/headers"; // Pour accéder aux cookies dans un composant serveur
import { Session } from "@/lib/models/session";
import { User } from "@/lib/models/user";
import { connectToDB } from "@/lib/utils/connectToDB";
import { connect } from "mongoose";

export async function sessionInfo() {
  // Lire le cookie 'sessionId'
  const cookieStore = cookies();
  const sessionId = cookieStore.get("sessionId")?.value;

  if (!sessionId) {
    return null; // Pas de session, donc pas d'utilisateur connecté
  }
  await connectToDB()
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



export async function validateSession(sessionId) {
  await connectToDB()
  if (!sessionId) {
    return null; // Pas de sessionId, donc pas de session valide
  }

  try {
    // Cherche la session dans la base de données
    const session = await Session.findOne({ _id: sessionId });

    if (!session) {
      return null; // Session inexistante
    }

    // Vérifie si la session est expirée
    const now = new Date();
    if (now > new Date(session.expiresAt)) {
      return null; // Session expirée
    }

    // Retourne l'utilisateur associé à la session si elle est valide
    return session.userId;
  } catch (error) {
    console.error("Erreur lors de la validation de la session :", error);
    return null; // En cas d'erreur, considère la session comme invalide
  }
}
