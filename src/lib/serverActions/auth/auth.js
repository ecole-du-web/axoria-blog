import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDB } from "@/lib/utils/connectToDB";
import { User } from "@/lib/models/user";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

const authenticateUser = async (credentials) => {
  try {
    connectToDB();
    console.log("CREDENTIALS", credentials)
    const user = await User.findOne({ userName: credentials.userName });

    if (!user) throw new Error("Wrong credentials!");

    const isPasswordCorrect = await bcrypt.compare(
      credentials.password,
      user.password
    );

    if (!isPasswordCorrect) throw new Error("Wrong credentials!");
console.log("AUTHENTICATEUSERUSER", user)
    return user;
  } catch (err) {
    console.log(err);
    throw new Error("Failed to login!");
  }
};

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        try {
          const user = await authenticateUser(credentials);
          return user;
        } catch (err) {
          return null;
        }
      },
    }),
  ],
  callbacks: { ...authConfig.callbacks },
  // callbacks: {
  //   async session({ session, user }) {
  //     const dbUser = await User.findOne({ email: session.user.email });
  //     session.user.id = dbUser._id; // Ajouter l'ID MongoDB de l'utilisateur à la session
  //     return session;
  //   },
  // },
});


// Oui, la chaîne que tu décris peut paraître complexe, mais elle est conçue pour être modulaire et flexible. Voici pourquoi :

// login (ta méthode) : Sert d'interface pour appeler signIn, ce qui te permet de gérer des comportements spécifiques (comme des erreurs ou des redirections) dans ton application.

// signIn (fournie par Auth) : Gère le processus d'authentification au niveau client, en envoyant une requête au backend pour vérifier les credentials.

// CredentialsProvider (dans Auth) : Détermine le type d'authentification utilisé (ici, via des credentials).

// authorize : Contient ta logique de vérification des credentials côté serveur.

// authenticateUser : Implémente les règles spécifiques (ex. vérification avec la base de données).
