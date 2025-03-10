import { Post } from "@/lib/models/post";
import { connectToDB } from "../../utils/db/connectToDB";
import { sessionInfo } from "../session/sessionMethods";
import { unstable_cache } from "next/cache";
import { Tag } from "@/lib/models/tag";
import mongoose from "mongoose";
import { User } from "@/lib/models/user";

import { notFound } from "next/navigation";

/*
Pour résumer, deux caches possibles : 
- le retour d'une méthode serveur 
- le cache d'une page statique

Une page statique est cachée et redistribuée à chaque call.
On peut la reconstruire grâce à revalidatePath(maPage), qui reconstruit la page ou revalidateTag.
Pour la reconstruire avec revalidateTag, il faut la "lier" à une méthode qu'elle utilise;
C'est à dire qu'il faut entourer une méthode serveur qu'elle utilise d'un unstable cache avec un argument tag.
Cela permettra de reconstruire la page ET le retour de la méthode cachée au revalidateTag.
Le tag peut être attaché à toutes les pages qui utilisent la méthode cachée, et donc toute revalider d'un coup.

Une page statique quant à elle, va toujours être créé à chaque requêtE.
Mais on peut quand même cacher le résultat d'une fonction qu'elle utilise.
Le mieux est donc de créer un tag unique par retour de fonction, via l'argument de la méthode.
Puis on peut revalider ce tag quand on modifie un article par exemple.

*/

export async function getPosts() {
  await connectToDB();
  const posts = await Post.find({})
    .populate("author", "userName normalizedUserName") // Peupler `author` avec seulement `userName`
    .select("title coverImageUrl slug createdAt updatedAt"); // Sélectionner les champs nécessaires

  return posts;
}

// export const getPosts = unstable_cache(
//   async () => {
//     await connectToDB();
//     const posts = await Post.find({})
//       .populate("author", "userName normalizedUserName") // Peupler `author` avec seulement `userName`
//       .select("title coverImageUrl slug createdAt updatedAt"); // Sélectionner les champs nécessaires

//     return posts;
//   },
//   // [], // Pas besoin de clé de cache supplémentaire, pas d'argument dynamique 
//   // { tags: ["posts"], revalidate: 60 } // Tag pour invalidation et cache pendant 60s
//   { tags: ["posts"] }
// );

// 📌 Pourquoi c’est important ?
// 1️⃣ Si tu utilises seulement keyParts ([userId])

// ✅ Chaque utilisateur a son propre cache.
// ❌ Mais tu ne peux pas supprimer un cache précis facilement.
// ❌ Il faut attendre l’expiration du cache (revalidate) ou utiliser unstable_noStore().
// 2️⃣ Si tu utilises tags sans keyParts

// ✅ Tu peux invalider un groupe de caches avec revalidateTag().
// ❌ Mais tous les utilisateurs partageraient le même cache, ce qui est un problème si chaque user doit avoir ses propres données en cache.
// 3️⃣ Si tu combines les deux (keyParts + tags)

// ✅ Chaque utilisateur a son propre cache (keyParts).
// ✅ Tu peux réinitialiser des caches ciblés (tags).






export async function getPost(slug) {
  await connectToDB();
  const post = await Post.findOne({ slug })
    .populate({
      path: "author", // Enrichit l'objet `author`
      select: "userName normalizedUserName", // Inclut les champs nécessaires depuis User
    })
    .populate({
      path: "tags",
      select: "name slug", // Inclut le champ `name` depuis Tag
    })
  if (!post) return notFound();
  return post
}




// export const getPost = unstable_cache(
//   async (slug) => {
//     console.log("DANS GET POST Là")
//     await connectToDB();
//     const post = await Post.findOne({ slug })
//       .populate({ path: "author", select: "userName normalizedUserName" })
//       .populate({ path: "tags", select: "name slug" });

//     if (!post) return notFound();
//     return post;
//   }
// );

// On crée une SA identique à getPost, afin de pouvoir revalider seulement revalider getPost quand on edit, ce qui évite de revalider potentiellement getPost qu'on utilise dans la page d'edit, ce qui produirait une 404
export async function getPostForEdit(slug) {
  await connectToDB();
  const post = await Post.findOne({ slug })
    .populate({
      path: "author", // Enrichit l'objet `author`
      select: "userName normalizedUserName", // Inclut les champs nécessaires depuis User
    })
    .populate({
      path: "tags",
      select: "name slug", // Inclut le champ `name` depuis Tag
    })
  if (!post) return notFound();
  return post
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
  const author = await User.findOne({ normalizedUserName });
  console.log("zzeazeaeazeaze",author)
  if (!author) {
    return  notFound()
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

// A tree hydrated but some attributes of the server rendered HTML didn't match the client properties. This won't be patched up. This can happen if a SSR-ed Client Component used:

// - A server/client branch `if (typeof window !== 'undefined')`.
// - Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
// - Date formatting in a user's locale which doesn't match the server.
// - External changing data without sending a snapshot of it along with the HTML.
// - Invalid HTML tag nesting.

// It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

// https://react.dev/link/hydration-mismatch

//   ...
//     <HotReload assetPrefix="">
//       <ReactDevOverlay state={{nextId:1, ...}} dispatcher={{...}}>
//         <DevRootHTTPAccessFallbackBoundary>
//           <HTTPAccessFallbackBoundary notFound={<NotAllowedRootHTTPFallbackError>}>
//             <HTTPAccessFallbackErrorBoundary pathname="/article/a..." notFound={<NotAllowedRootHTTPFallbackError>} ...>
//               <RedirectBoundary>
//                 <RedirectErrorBoundary router={{...}}>
//                   <Head>
//                   <link>
//                   <RootLayout>
//                     <html lang="en" className="h-full">
//                       <link>
//                       <meta>
//                       <body
//                         className="flex min-h-full flex-col"
// -                       cz-shortcut-listen="true"
//                       >
//                   ...
//         ...

// overrideMethod @ hook.js:608Understand this errorAI
// connectToDB.js:5  Server  Using existing connection: axoriablog
// hook.js:608 Error: Rendered more hooks than during the previous render.
//     at updateWorkInProgressHook (react-dom-client.development.js:4832:17)
//     at updateMemo (react-dom-client.development.js:5728:18)
//     at Object.useMemo (react-dom-client.development.js:22898:18)
//     at exports.useMemo (react.development.js:1495:34)
//     at Router (app-router.js:187:59)
//     at react-stack-bottom-frame (react-dom-client.development.js:23610:20)
//     at renderWithHooks (react-dom-client.development.js:4646:22)
//     at updateFunctionComponent (react-dom-client.development.js:8032:19)
//     at beginWork (react-dom-client.development.js:9689:18)
//     at runWithFiberInDEV (react-dom-client.development.js:544:16)
//     at performUnitOfWork (react-dom-client.development.js:15064:22)
//     at workLoopSync (react-dom-client.development.js:14888:41)
//     at renderRootSync (react-dom-client.development.js:14868:11)
//     at performWorkOnRoot (react-dom-client.development.js:14394:44)
//     at performWorkOnRootViaSchedulerTask (react-dom-client.development.js:15955:7)
//     at MessagePort.performWorkUntilDeadline (scheduler.development.js:44:48)

// The above error occurred in the <Router> component. It was handled by the <ErrorBoundaryHandler> error boundary. Error Component Stack
//     at Router (app-router.js:183:11)