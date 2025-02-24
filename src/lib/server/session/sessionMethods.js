import { cookies } from "next/headers"; // Pour accéder aux cookies dans un composant serveur
import { Session } from "@/lib/models/session";
import { User } from "@/lib/models/user";
import { connectToDB } from "@/lib/utils/db/connectToDB";
import { connect } from "mongoose";

export async function sessionInfo() {
  // Lire le cookie 'sessionId'
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;

  if (!sessionId) {
    return { success: false };
    // Pas de session, donc pas d'utilisateur connecté
  }


  await connectToDB()

  // Vérifier la session dans la base de données
  const session = await Session.findById(sessionId);

  if (!session || session.expiresAt < new Date()) {
    return { success: false };
    // Session invalide ou expirée
  }

  // Charger l'utilisateur lié à la session
  const user = await User.findById(session.userId);

  if (!user) {
    return { success: false };
  }

  return { success: true, userId: user._id.toString() };

}


