"use server"; 
// lib/auth.methods.js
import bcrypt from "bcryptjs";

import { connectToDB } from "@/lib/utils/utils";// Fonction de connexion à la base de données
import { User } from "../../models/user";



// Méthode de connexion (login)
export const login = async (credentials) => {
  console.log("LOGIN METHOD ACTIVATED !!!!")
  await connectToDB();

  const user = await User.findOne({ email: credentials.email });
  if (!user) throw new Error("Invalid credentials");

  const isPasswordCorrect = await bcrypt.compare(
    credentials.password,
    user.password
  );
  if (!isPasswordCorrect) throw new Error("Invalid credentials");

  // A ce stade, l'authentification est réussie, mais pour gérer la session,
  // il faut configurer l'authentification via un JWT ou une autre méthode côté serveur

  // Retourne un objet JSON simple avec les informations essentielles
  // return {
  //   id: user._id, // Assure-toi que l'id est inclus
  //   email: user.email,
  //   username: user.username,
  //   isAdmin: user.isAdmin,
  // };
};



// Méthode d'inscription (signup)
export const signup = async (credentials) => {
  await connectToDB();

  const existingUser = await User.findOne({ email: credentials.email });
  if (existingUser) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(credentials.password, 10);

  const newUser = new User({
    email: credentials.email,
    password: hashedPassword,
    username: credentials.username || credentials.email.split('@')[0],
  });

  await newUser.save();

  // Appelle directement ta méthode login qui est configurée dans NextAuth
  // Une fois l'inscription réussie, connecte l'utilisateur
  return await login({
    email: credentials.email,
    password: credentials.password,
  });
};