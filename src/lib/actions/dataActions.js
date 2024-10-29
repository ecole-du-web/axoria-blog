"use server"
import { Post } from "../models/post";
import { User } from "../models/user";
import { connectToDB } from "../utils/utils";
import { unstable_noStore as noStore } from "next/cache";
import { auth } from "./auth/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Tag } from "../models/tag";

export const getPosts = async () => {
  try {
    await connectToDB();
    const posts = await Post.find();
    // console.log(posts)
    return posts;
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch posts!");
  }
};

export const getPost = async (slug) => {
  try {
    await connectToDB();
    console.log(`Fetching post with slug: ${slug}`);
    
    // Récupérer l'objet Mongoose
    // Il faut import Tag quand on populate
    // select s'applique au modèle principal ici POST, et populate aux documents d'un autre modèle lié.
    // Ex : const post = await Post.findOne({ slug })
    // .select("title content")  // Champs du modèle Post
    // .populate("tags", "name description"); // Champs du modèle Tag
    const post = await Post.findOne({ slug }).populate("tags", "name");
    if (!post) return null;
    
    // Convertir l'objet en un objet simple
    const plainPost = post.toObject();
    // Conversion explicite des champs nécessaires
    return {
      ...plainPost,
      author:  post.author.name, // Exemple: inclure seulement le nom de l'auteur car sinon bug not plain object

      _id: plainPost._id.toString(), // Convertir ObjectId en chaîne
      tags: plainPost.tags.map(tag => ( // On ne garde que le nom qui est unique, pas besoin de prendre l'_id implicitement retourné par populate.
        tag.name           // Nom du tag
      )), // Convertir chaque tag ObjectId en chaîne
      createdAt: plainPost.createdAt.toISOString(), // Convertir date en chaîne ISO
      updatedAt: plainPost.updatedAt.toISOString(), // Convertir date en chaîne ISO
    };
  } catch (err) {
    console.error("Error fetching post:", err);
    throw new Error("Failed to fetch post!");
  }
};

export const getUser = async (id) => {
  noStore();
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


export const getUserPosts = async () => {
  try {
    // Connexion à la base de données
    await connectToDB();

    // Récupérer la session pour obtenir l'ID de l'utilisateur connecté
    const session = await auth(); 
    const userId = session?.user?.id;  // Récupérer l'ID de l'utilisateur connecté

    if (!userId) {
      throw new Error("Utilisateur non authentifié");
    }

    // Rechercher tous les articles créés par cet utilisateur
    const posts = await Post.find({ author: userId }).select("title _id slug");

    return posts;  // Retourner les articles filtrés par l'utilisateur
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch user posts!");
  }
};

export const deletePost = async (formData) => {
  const { id } = Object.fromEntries(formData);
  
  try {
    await connectToDB();

    await Post.findByIdAndDelete(id);
    console.log("deleted from db");
    // à voir mais mets à jour automatiquement meme si on est sur la pge, plus pratique qu'un redirect mais trop documenté.
    revalidatePath("/dashboard");
    // redirect("/dashboard");
  } catch (err) {
    console.log(err);
    return { error: "Something went wrong!" };
  }
};

// SANS DB

// TEMPORARY DATA
// const users = [
//   { id: 1, name: "John" },
//   { id: 2, name: "Jane" },
// ];

// const posts = [
//   { id: 1, title: "Post 1", body: "......", userId: 1 },
//   { id: 2, title: "Post 2", body: "......", userId: 1 },
//   { id: 3, title: "Post 3", body: "......", userId: 2 },
//   { id: 4, title: "Post 4", body: "......", userId: 2 },
// ];

// export const getPosts = async () => {
//   return posts
// };

// export const getPost = async (id) => {
//   const post = posts.find((post) => post.id === parseInt(id))
//   return post
// };

// export const getUser = async (id) => {
//   return users.find((user) => user.id === parseInt(id))
// };

