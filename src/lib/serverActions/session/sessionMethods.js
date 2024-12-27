"use server";

import { User } from "@/lib/models/user";
import { Session } from "@/lib/models/session";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers"; // Pour définir des cookies HTTP-only
import { normalizeText } from "@/lib/utils/utils-methods";
import { connectToDB } from "@/lib/utils/connectToDB";

export const register = async (formData) => {
  console.log("ENREGISTREMENT UTILISATEUR", formData);
  const { userName, email, password, passwordRepeat } = Object.fromEntries(formData);

  if (userName.length < 3) {
    throw new Error("Username too short")
  }

  if (password !== passwordRepeat) {
    throw new Error("Passwords do not match")
  }

  try {
    connectToDB();

    const user = await User.findOne({ userName });

    if (user) {
      throw new Error("UserName already exists")
    }

    // Version normalisée pour les URLS/utilisation dans les autres server actions (getPostsByAuthor)
    const normalizedUserName = normalizeText(userName);
    console.log(normalizedUserName)

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      userName,
      normalizedUserName,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    console.log("saved to db");


    // Retournez un succès sans essayer de connecter l'utilisateur
    return { success: true };
  } catch (err) {
    console.error(err);
    throw new Error("Something went wrong!");
  }
};



// Fonction de login
export async function login(formData) {
  await connectToDB()
  const userName = formData.get("userName");
  const password = formData.get("password");
  console.log("zzzzzzzzzqsd",userName)
  const user = await User.findOne({ userName: userName });
  if (!user) {
    throw new Error("Invalid credentials"); // Attention pas d'affichage d'info sur les users/psw côté client
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid credentials")
  }

  // Vérifie si une session existe déjà
  const existingSession = await Session.findOne({
    userId: user._id,
    expiresAt: { $gt: new Date() }, // Session valide non expirée
  });

  let session;
  if (existingSession) {
    session = existingSession; // Réutilise la session existante
  } else {
    // Crée une nouvelle session si aucune n'existe
    session = new Session({
      userId: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expiration dans 1 semaine
    });
    await session.save();
  }

  // Définir un cookie HTTP-only avec le sessionId
  const cookieStore = cookies();
  cookieStore.set("sessionId", session._id.toString(), {
    httpOnly: true, // Empêche l'accès côté client
    secure: process.env.NODE_ENV === "production", // Assure la sécurité en prod
    path: "/", // Disponible pour toutes les routes
    maxAge: 7 * 24 * 60 * 60, // 1 semaine
    sameSite: "strict", // Protéger contre les attaques CSRF
  });

  return { success: true }; // Retourne un succès simple
}





// Fonction de logout
export async function logout() {
  const cookieStore = cookies();
  const sessionId = cookieStore.get("sessionId")?.value;


  try {
    // Supprime la session de la base de données
    await Session.findByIdAndDelete(sessionId);

    // Supprime le cookie sessionId
    cookieStore.set("sessionId", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0, // Supprime immédiatement le cookie
      sameSite: "strict",
    });

    return { success: true }; // Confirme le logout
  } catch (error) {
    console.error(error)
  }
}
