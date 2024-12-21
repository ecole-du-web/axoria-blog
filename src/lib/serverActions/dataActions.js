"use server"
import { Post } from "../models/post";
import { User } from "../models/user";
import { connectToDB } from "../utils/connectToDB";
import { unstable_noStore as noStore } from "next/cache";
import { auth } from "./auth/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Tag } from "../models/tag";
import mongoose from "mongoose";




export const getPosts = async () => {
  try {
    await connectToDB();
    const posts = await Post.find({})
      .populate("author", "userName normalizedUserName") // Peupler `author` avec seulement `userName`
      .select("title coverImageUrl thumbnailUrl slug createdAt updatedAt"); // Sélectionner les champs nécessaires

    return posts;
  } catch (err) {
    console.error("Error fetching posts:", err);
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
    const post = await Post.findOne({ slug })
      .populate({
        path: "author", // Enrichit l'objet `author`
        select: "userName normalizedUserName", // Inclut les champs nécessaires depuis User
      })
      .populate({
        path: "tags",
        select: "name", // Inclut le champ `name` depuis Tag
      });

    console.log("Post enrichi :", post);
    // On utilise populate ici car author et tags sont des références (ObjectId) à d'autres collections. populate permet d'enrichir ces références avec leurs données. À l'inverse, select est utilisé pour limiter les champs directement sur le document principal (ici Post). Donc, pour les sous-documents référencés, populate avec un sélecteur est nécessaire.


    if (!post) return null;

    // Convertir l'objet en un objet simple

    // c'est différent d'avec getPosts car : lean() : Quand vous utilisez .lean() sur une requête Mongoose (ou implicitement dans des méthodes de récupération multiples), les documents retournés ne sont pas des objets Mongoose enrichis mais des objets JavaScript purs. Cela signifie qu'ils n'ont pas les méthodes et les propriétés supplémentaires que Mongoose ajoute, rendant inutile l'appel de toObject().
    const plainPost = post.toObject();
    // Conversion explicite des champs nécessaires
    return {
      ...plainPost,
      author: post.author.userName, // Exemple: inclure seulement le nom de l'auteur car sinon bug not plain object
      normalizedUserName: post.author.normalizedUserName,

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


// Fonction pour récupérer les tags
export async function getTags() {
  try {
    await connectToDB();
  } catch (error) {
    console.error("Erreur de connexion à la base de données:", error);
    return []; // Retourne une liste vide si la connexion échoue
  }

  try {
    const tags = await Tag.aggregate([
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "tags",
          as: "postsWithTag",
        },
      },
      {
        $addFields: { postCount: { $size: "$postsWithTag" } },
      },
      // Filtre pour ne garder que les tags avec au moins 1 article
      {
        $match: { postCount: { $gt: 0 } },
      },
      {
        $sort: { postCount: -1 },
      },
      {
        $project: { postsWithTag: 0 }, // Exclut le champ `postsWithTag` de la sortie
      },
    ]);

    return tags;
  } catch (error) {
    console.error("Erreur lors de la récupération des tags:", error);
    return [];
  }
}


export const getArticlesByTag = async (tagName) => {
  try {
    await connectToDB();

    const tag = await Tag.findOne({ name: tagName });

    if (!tag) return { error: "Tag not found" };

    const posts = await Post.find({ tags: tag._id })
      .populate({
        path: "author",
        select: "userName normalizedUserName", // Récupère uniquement userName pour l'auteur
      })
      .select("title coverImageUrl thumbnailUrl slug createdAt updatedAt author "); // Sélectionne les champs nécessaires

    return posts;
  } catch (err) {
    console.error("Erreur lors de la récupération des articles par tag:", err);
    throw new Error("Failed to fetch articles by tag!");
  }
};


export const getArticlesByAuthor = async (normalizedUserName) => {
  console.log("Recherche des articles pour l'auteur :", normalizedUserName);

  try {
    await connectToDB();

    // Étape 1 : Trouver l'auteur correspondant au `normalizedUserName`
    // Retourne un objet avec l'objectId de base, + ce qu'on select userName pour le passer à l'objet final et l'afficher sur la page, et normalizedUserName
    const author = await User.findOne({ normalizedUserName }).select("userName");
    console.log("ZZZZZZZZZZZZZZZZZZZZZZZZ", author)
    if (!author) {
      console.log("Aucun auteur trouvé avec ce normalizedUserName");
      return { author: null, articles: [] }; // Retourner un objet vide si l'auteur n'est pas trouvé
    }

    // Étape 2 : Trouver les articles pour cet auteur
    const articles = await Post.find({ author: author._id })
      .populate({
        path: "author",
        select: "userName normalizedUserName", // Enrichir les informations sur l'auteur
      })
      .select("title coverImageUrl thumbnailUrl slug createdAt updatedAt");

    // Retourner l'objet contenant l'auteur et ses articles
    return {
      author: {
        userName: author.userName,
      },
      articles,
    };
  } catch (err) {
    console.error("Erreur lors de la récupération des articles par auteur :", err);
    throw new Error("Failed to fetch articles by author!");
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

