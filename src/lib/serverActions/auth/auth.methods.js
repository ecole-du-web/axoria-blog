"use server";
import { connectToDB } from "@/lib/utils/connectToDB";
import { User } from "@/lib/models/user";
import { revalidatePath } from "next/cache";
import { signIn, signOut } from "./auth";
import { getSession } from "next-auth/react";
import bcrypt from "bcryptjs"
import { isRedirectError } from "next/dist/client/components/redirect";
import { AuthError } from 'next-auth';
import { normalizeUsername } from "@/lib/utils/utils-methods"; 

export async function handleLogout() {
  await signOut()
  console.log("Déconnexion effectuée, session réinitialisée.");

}


export const register = async (formData) => {
  console.log("ENREGISTREMENT UTILISATEUR", formData);
  const { userName, email, password, passwordRepeat } = Object.fromEntries(formData);

  if (userName.length < 3) {
    return { errorMsg: "Username too short" };
  }

  if (password !== passwordRepeat) {
    return { errorMsg: "Passwords do not match" };
  }

  try {
    connectToDB();

    const user = await User.findOne({ userName });

    if (user) {
      return { errorMsg: "UserName already exists" };
    }

    // Version normalisée pour les URLS/utilisation dans les autres server actions (getPostsByAuthor)
    const normalizedUserName = normalizeUsername(userName);
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
   return { error: "Something went wrong!" };
 }
};



export const login = async (formData) => {
  console.log(Object.fromEntries(formData))
  const { userName, password } = Object.fromEntries(formData);
  try {
    await signIn("credentials", { userName, password });
    // signIn retourne une erreur Credentials si il y a un problèm au niveau des cred, sinon une autre si c'est une erreur serveur
    // après le succès du signIn, signIn utilise next redirect() vers la même paeg, qui retourne une erreur, il faut catch cette erreur avec le throw error si on veut que la session soit bien mise à jour.
    // Si on redirect false, la session n'est pas bien mise à jour et la navbar n'affiche pas ce qu'il faut
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return {errorMsg: 'Invalid credentials.'};
        default:
          return {errorMsg: 'Something went wrong.'};
      }
    }
    throw error; // Throw permet à next auth de prendre en compte la nouvelle session dans la construction de la page post redirection.
  }
};
