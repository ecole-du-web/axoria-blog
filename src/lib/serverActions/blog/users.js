"use server"
import { connectToDB } from "@/lib/utils/connectToDB";
import { User } from "@/lib/models/user";
// import mongoose from "mongoose";
import { unstable_noStore as noStore } from "next/cache";

export const getUser = async (id) => {
  noStore(); // ?
  try {
    await connectToDB();
    const user = await User.findById(id);
    return user;
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch user!");
  }
};

export const getUsers = async () => {
  try {
    await connectToDB();
    const users = await User.find();
    return users;
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch users!");
  }
};


export const getUserPostsFromSessionID = async () => {
  try {
    // Connexion à la base de données
    await connectToDB();

    // Récupérer la session et extraire l'ID de l'utilisateur
    const session = await auth();
    const userId = new mongoose.Types.ObjectId(session?.user?.id);
    console.log("getUserPostsFromSessionID", userId)

    if (!userId) {
      throw new Error("Utilisateur non authentifié");
    }

    // Rechercher les articles créés par cet utilisateur
    const posts = await Post.find({ author: userId }).select("title _id slug");
    console.log("Articles trouvés :", posts);
    
    return posts;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to fetch user posts!");
  }
};


