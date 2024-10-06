// lib/auth.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { login, signup } from "./auth.methods";  // Import des méthodes
import { authConfig } from "./auth.config";  // Import de la config des routes

// Configuration de NextAuth
const nextAuthOptions = {
  ...authConfig,
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        // Utilise la méthode login pour authentifier l'utilisateur
        return await login(credentials);
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
  },
};

export default nextAuthOptions;
