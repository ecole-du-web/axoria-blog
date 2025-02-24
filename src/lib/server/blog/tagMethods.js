import { connectToDB } from "@/lib/utils/db/connectToDB";
import { Tag } from "@/lib/models/tag";
import { Post } from "@/lib/models/post";
import { unstable_cache } from 'next/cache';

// Exactement, on gère le cache avec unstable_cache uniquement dans les méthodes qui récupèrent des données pour être affichées sur des routes, car c'est ce cache que Next.js utilise pour optimiser les réponses et revalider les routes liées. Les méthodes transactionnelles (CRUD) accèdent directement à la base de données et ne dépendent pas de ce mécanisme.
// Fonction pour récupérer les tags
export async function getTags() {

    // Connexion à la base de données MongoDB
    await connectToDB();

    // Exécution d'une agrégation sur la collection "Tag"
    // "La méthode aggregate() de Mongoose permet de retourner un tableau d'objets représentant des documents d'un modèle, enrichis avec des données d'un autre modèle via une jointure ($lookup) basée sur un champ commun, comme _id." ✅
    const tags = await Tag.aggregate([
      // Une jointure en MongoDB ($lookup) permet de combiner des documents de deux collections différentes en fonction d'un champ commun
      // 1️⃣ Jointure entre "tags" et "posts"
      {
        $lookup: {
          from: "posts",           // Collection avec laquelle on fait la jointure (posts)
          localField: "_id",       // Champ de "tags" utilisé pour la jointure (l'ID du tag)
          foreignField: "tags",    // Champ dans "posts" qui contient les références aux tags
          as: "postsWithTag",      // Nom du tableau contenant les posts associés à chaque tag
        },
      },

      // 2️⃣ Ajout d'un champ `postCount` pour compter le nombre d'articles liés à chaque tag
      {
        $addFields: { 
          postCount: { $size: "$postsWithTag" } // `$size` compte les éléments du tableau "postsWithTag"
        },
      },

      // 3️⃣ Filtre pour ne garder que les tags qui ont au moins 1 article associé
      {
        $match: { postCount: { $gt: 0 } }, // `$gt: 0` signifie "strictement supérieur à 0"
      },

      // 4️⃣ Trie les tags par nombre d'articles associés (du plus grand au plus petit)
      {
        $sort: { postCount: -1 }, // `-1` = ordre décroissant (du plus grand au plus petit)
      },

      // 5️⃣ Supprime le champ "postsWithTag" pour ne pas envoyer les articles dans la réponse
      {
        $project: { postsWithTag: 0 }, // `0` = ne pas inclure ce champ dans le résultat final
      },
    ])

    // Retourne la liste des tags traités
    return tags;

}




