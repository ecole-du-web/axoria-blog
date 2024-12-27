import { Post } from "@/lib/models/post";
import { connectToDB } from "../../utils/connectToDB";
import { sessionInfo } from "../session/sessionMethods";
import { unstable_cache } from "next/cache";
import { Tag } from "@/lib/models/tag";
import { User } from "@/lib/models/user";
import { redirect } from "next/navigation";
// Avec unstable_cache
// export const getPosts = unstable_cache(
//   async () => {
//     try {
//       await connectToDB();
//       const posts = await Post.find({})
//         .populate("author", "userName normalizedUserName") // Peupler `author` avec seulement `userName`
//         .select("title coverImageUrl slug createdAt updatedAt"); // Sélectionner les champs nécessaires

//       return posts;
//     } catch (err) {
//       console.error("Error fetching posts:", err);
//       throw new Error("Failed to fetch posts!");
//     }
//   },
//   ['posts'], // Utilisé comme clé de cache, pour que Next réutilise potentiellement les résultats de cette requête
//   // { revalidate: 3600, tags: ['posts'] } // Cache pendant 3600 secondes et attache le tag posts aux routes qui l'utilisent
//   { tags: ['posts'] } // attache le tag posts aux routes qui l'utilisent
// );

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


export const getPost = unstable_cache(
  async (slug) => {
    try {
      await connectToDB();
      console.log(`Fetching post with slug: ${slug}`);

      // Récupérer l'objet Mongoose
      const post = await Post.findOne({ slug })
        .populate({
          path: "author", // Enrichit l'objet `author`
          select: "userName normalizedUserName", // Inclut les champs nécessaires depuis User
        })
        .populate({
          path: "tags",
          select: "name slug", // Inclut le champ `name` depuis Tag
        });

      console.log("Post enrichi :", post);

      if (!post) return null;

      // Convertir l'objet en un objet simple
      const plainPost = post.toObject();
      return {
        ...plainPost,
        author: post.author.userName, // Inclure seulement le nom de l'auteur
        normalizedUserName: post.author.normalizedUserName,

        _id: plainPost._id.toString(), // Convertir ObjectId en chaîne
        tags: plainPost.tags.map(tag => ({
          name: tag.name,
          slug: tag.slug,
        })), // Convertir chaque tag ObjectId en chaîne
        createdAt: plainPost.createdAt.toISOString(), // Convertir date en chaîne ISO
        updatedAt: plainPost.updatedAt.toISOString(), // Convertir date en chaîne ISO
      };
    } catch (err) {
      console.error("Error fetching post:", err);
      throw new Error("Failed to fetch post!");
    }
  },
  (slug) => [`post_${slug}`], // Générer une clé unique pour le cache
  { tags: ['posts'] } // Associer le tag `posts` pour la revalidation si nécessaire
);


export const getUserPostsFromSessionID = unstable_cache(
  // On passe userId à la méthode car on ne peut pas lire les cookies directement dans une méthode cachée car c'est du dynamique les cookies
  async (userId) => {
    try {
      // Connexion à la base de données
      await connectToDB();

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
  },
  (userId) => [`user_posts_${userId}`], // Clé unique pour le cache basée sur userId
  { tags: ["posts"] } // Associer le tag posts pour la revalidation
);


export const getPostsByAuthor = unstable_cache(
  async (normalizedUserName) => {
    console.log("Recherche des articles pour l'auteur :", normalizedUserName);
    let author, posts
    try {
      await connectToDB();

      // Étape 1 : Trouver l'auteur correspondant au `normalizedUserName`
      // Retourne un objet avec l'objectId de base, + ce qu'on select userName pour le passer à l'objet final et l'afficher sur la page, et normalizedUserName
      author = await User.findOne({ normalizedUserName }).select("userName");
      console.log(author, "zesldfsdklfsd")

      // Étape 2 : Trouver les articles pour cet auteur
      if (author) {

        posts = await Post.find({ author: author._id })
          .populate({
            path: "author",
            select: "userName normalizedUserName", // Enrichir les informations sur l'auteur
          })
          .select("title coverImageUrl thumbnailUrl slug createdAt updatedAt");

      }
      // Retourner l'objet contenant l'auteur et ses articles
    } catch (err) {
      console.error("Erreur lors de la récupération des articles par auteur:", err);
      throw new Error(err)
    }
    if (!author) {
      redirect("/404"); // Redirection directe vers la page 404 // Une redirection depuis le serveur fonctionne en envoyant une réponse HTTP au client avec un code de statut 3xx (généralement 301 ou 302) et un en-tête Location qui indique l'URL cible de la redirection.
    } else {
      return { author, posts }; // Attention contrairement au tag on ajout l'auteur pour avoir son nom bien écrit, pas normalizé
    }
  },
  (normalizedUserName) => [`posts_by_author_${normalizedUserName}`], // Clé unique pour le cache 
  // La clé peut être une fonction lorsque le paramètre (normalizedUserName, par exemple) est passé dynamiquement à la méthode encapsulée par unstable_cache. Cela permet de générer la clé à l'exécution en fonction des arguments, comme ceci :
  { tags: ['posts'] } // Associer le tag `posts` pour la revalidation
);


export const getPostsByTag = unstable_cache(
  async (tagSlug) => {
    let tag, posts

    // on try connectToDB et les autres méthodes, mais on utilise des let pour les remplir et vérifier leur présence pour par la suite redirect, ou pas.
    try {
      await connectToDB();

      tag = await Tag.findOne({ slug: tagSlug });


      if (tag) {

        posts = await Post.find({ tags: tag._id })
          .populate({
            path: "author",
            select: "userName normalizedUserName", // Récupère uniquement userName pour l'auteur
          })
          .select("title coverImageUrl thumbnailUrl slug createdAt updatedAt author "); // Sélectionne les champs nécessaires
      }

    } catch (err) {
      console.error("Erreur lors de la récupération des articles par tag:", err);
      throw new Error(err)
    }
    if (!tag) {
      redirect("/404"); // Redirection directe vers la page 404 // Une redirection depuis le serveur fonctionne en envoyant une réponse HTTP au client avec un code de statut 3xx (généralement 301 ou 302) et un en-tête Location qui indique l'URL cible de la redirection.
    } else {
      return posts;
    }
  },
  // Génération d'une clé de cache basée sur le paramètre `tagSlug`
  (tagSlug) => [`posts_by_tag_${tagSlug}`],
  // Options (tags, revalidation, etc.)
  { tags: ["posts"] }
);


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
