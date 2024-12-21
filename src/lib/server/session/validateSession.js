import { Session } from "@/lib/models/session";

export async function validateSession(sessionId) {
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
