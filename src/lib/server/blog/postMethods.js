import { Post } from "@/lib/models/post";
import { connectToDB } from "../../utils/db/connectToDB";
import { sessionInfo } from "../session/sessionMethods";
import { unstable_cache } from "next/cache";
import { Tag } from "@/lib/models/tag";
import mongoose from "mongoose";
import { User } from "@/lib/models/user";

import { notFound } from "next/navigation";


// Fonction sans unstable_cache
export async function getPosts() {
  try {
    await connectToDB();
    const posts = await Post.find({})
      .populate("author", "userName normalizedUserName") // Peupler `author` avec seulement `userName`
      .select("title coverImageUrl slug createdAt updatedAt"); // Sélectionner les champs nécessaires

    return posts;
  } catch (err) {
    console.error("Error fetching posts:", err);
    throw new Error("Failed to fetch posts!");
  }
};


export async function getPost(slug) {
  try {
    await connectToDB();

    // Récupérer l'objet Mongoose
    const post = await Post.findOne({ slug })
      .populate({
        path: "author", // Enrichit l'objet `author`
        select: "userName normalizedUserName", // Inclut les champs nécessaires depuis User
      })
      .populate({
        path: "tags",
        select: "name slug", // Inclut le champ `name` depuis Tag
      })
    // .lean(); // check ça
    if (!post) return notFound();
    return post
  } catch (err) {
    console.error("Error fetching post:", err);
    throw new Error("Failed to fetch post!");
  }
}



export async function getUserPostsFromSessionID(userId) {

  // On passe userId à la méthode car on ne peut pas lire les cookies directement dans une méthode cachée car c'est du dynamique les cookies
  // Connexion à la base de données
  await connectToDB();


  // Rechercher les articles créés par cet utilisateur
  const posts = await Post.find({ author: userId }).select("title _id slug").lean();
  // Lean retourne simlpement des objets moins chargés de méthodes mongoose
  // console.log("posts",posts);
  // console.log(posts[0] instanceof mongoose.Model);
  return posts;
}



export async function getPostsByAuthor(normalizedUserName) {
  await connectToDB();

  // Étape 1 : Trouver l'auteur correspondant au `normalizedUserName`
  // Retourne un objet avec l'objectId de base, + ce qu'on select userName pour le passer à l'objet final et l'afficher sur la page, et normalizedUserName
  const author = await User.findOne({ normalizedUserName }).select("userName");
  if (!author) {
    notFound()
  }

  // Étape 2 : Trouver les articles pour cet auteur

  const posts = await Post.find({ author: author._id })
    .populate({
      path: "author",
      select: "userName normalizedUserName", // Enrichir les informations sur l'auteur
    })
    .select("title coverImageUrl slug createdAt updatedAt")
    .sort({ createdAt: -1 });


  // Retourner l'objet contenant l'auteur et ses articles
  return { author, posts }; // Attention contrairement au tag on ajout l'auteur pour avoir son nom bien écrit, pas normalizé
}

export async function getPostsByTag(tagSlug) {
  // on try connectToDB et les autres méthodes, mais on utilise des let pour les remplir et vérifier leur présence pour par la suite redirect, ou pas.
  await connectToDB();

  const tag = await Tag.findOne({ slug: tagSlug });
  if (!tag) {
    notFound() // Redirection directe vers la page 404 // Une redirection depuis le serveur fonctionne en envoyant une réponse HTTP au client avec un code de statut 3xx (généralement 301 ou 302) et un en-tête Location qui indique l'URL cible de la redirection.
  }

  const posts = await Post.find({ tags: tag._id })
    // Quand on lie deux documents de modèles différents via un ID (ObjectId), on appelle ça une relation par référence (Reference Relationship).
    // populate() → Récupère les données liées d'une autre collection via une référence (ObjectId) (ex: récupérer l'auteur d’un post).
    // aggregate() → Permet des requêtes avancées avec jointures ($lookup), filtres ($match), tris ($sort), et comptages ($count).
    .populate({
      path: "author",
      select: "userName", // Récupère uniquement userName pour l'auteur
    })
    // Sélectionne les champs souhaités de Post
    .select("title coverImageUrl slug createdAt updatedAt author ")  // Sélectionne les champs nécessaires
    .sort({ createdAt: -1 })
    .lean()

  return posts;
}

