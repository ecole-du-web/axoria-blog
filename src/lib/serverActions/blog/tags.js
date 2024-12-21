"use server"
import { connectToDB } from "@/lib/utils/connectToDB";
import { Tag } from "@/lib/models/tag";
// import mongoose from "mongoose";

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


