import { connectToDB } from "@/lib/utils/connectToDB";
import { Tag } from "@/lib/models/tag";
import { Post } from "@/lib/models/post";
import { unstable_cache } from 'next/cache';

// Exactement, on gère le cache avec unstable_cache uniquement dans les méthodes qui récupèrent des données pour être affichées sur des routes, car c'est ce cache que Next.js utilise pour optimiser les réponses et revalider les routes liées. Les méthodes transactionnelles (CRUD) accèdent directement à la base de données et ne dépendent pas de ce mécanisme.
// Fonction pour récupérer les tags
export const getTags = unstable_cache(
  async () => {

    try {

      await connectToDB();

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
  },
  ['tags'], // Clé unique pour le cache
  { tags: ['tags'] } // Associer le tag `tags` pour revalidation si nécessaire
);




