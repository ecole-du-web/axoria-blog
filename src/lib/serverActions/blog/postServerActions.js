"use server"

import { Post } from "@/lib/models/post";
import { connectToDB } from "../../utils/db/connectToDB";
import { revalidatePath, revalidateTag } from "next/cache";
import { ref, uploadBytes, getDownloadURL, deleteObject, getStorage } from "firebase/storage";
import { storage } from "@/lib/utils/firebase/firebase"; // Importer Firebase Storage
import sharp from "sharp"
import { marked } from 'marked';  // Import de la bibliothèque marked
import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';
import { getPost } from "@/lib/server/blog/postMethods";
import { sessionInfo } from "../../server/session/sessionMethods";
import { findOrCreateTag } from "./utils";
import { Tag } from "../../models/tag";
import slugify from "slugify";
import Prism from "prismjs"
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript'; // Ajouter les composants nécessaires pour Prism
import { markedHighlight } from 'marked-highlight';
import AppError from "@/lib/utils/errorHandling/customError";
import crypto from "crypto"
import { generateUniqueSlug } from "@/lib/utils/general/utils";

// Créer un DOM simulé pour DOMPurify côté serveur
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);


export async function addPost(formData) {
  const { title, markdownArticle, tags, coverImage } = Object.fromEntries(formData);

  // Validation
  if (typeof title !== "string" || title.trim().length < 3) {
    throw new AppError("Title must be at least 3 characters long")
  }

  if (typeof markdownArticle !== "string" || markdownArticle.trim().length === 0) {
    throw new AppError("Article content is required")
  }


  // Il manque la validation serveur
  try {
    // Connexion à la base de données
    await connectToDB();

    // Récupérer la session utilisateur
    const session = await sessionInfo();
    if (!session.success) {
      throw new AppError("Authentication required");
    }



    // 1. Gérer l'upload de l'image


    if (!coverImage || !(coverImage instanceof File)) {
      throw new Error("Invalid data");
    }

    const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]; // Liste des formats acceptés

    if (!validImageTypes.includes(coverImage.type)) {
      throw new Error("Invalid data");
    }
    const imageBuffer = Buffer.from(await coverImage.arrayBuffer()); // Réception : L’image est envoyée sous un certain format (JPEG, PNG, etc.).
    // Conversion en buffer : On la transforme en données brutes pour la manipuler (Buffer.from(await coverImage.arrayBuffer())).
    // Manipulation : On peut vérifier les dimensions, redimensionner, optimiser avec Sharp ou une autre lib.
    // Reconversion : On la remet en format utilisable (JPEG, PNG, etc.) avant de l’enregistrer ou l’envoyer.

    const { width, height } = await sharp(imageBuffer).metadata();
    if (width > 1280 || height > 720) {
      throw new AppError("Image size must not exceed 1280x720 pixels");
    }

    const uniqueFileName = `${crypto.randomUUID()}_${coverImage.name}`;

    // upload vers la storage zone
    const uploadUrl = `${process.env.BUNNY_STORAGE_HOST}/${process.env.BUNNY_STORAGE_ZONE}/${uniqueFileName}`;

    // lien de la pull zone optimisée, pull zone sert le premier service à fond puis le cache pour les prochains user de la mêmùe zone
    const publicImageUrl = `https://pull-zone-axoriablog.b-cdn.net/${uniqueFileName}`;


    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "AccessKey": process.env.BUNNY_STORAGE_API_KEY,
        "Content-Type": "application/octet-stream",
      },
      body: imageBuffer,
    });
    /*
    ajouter l'url dans next config
const nextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com', "storage.bunnycdn.com"], // Ajoutez le domaine de Firebase ici
  },
};

export default nextConfig;
    */
    if (!response.ok) {
      throw new Error(`Error while uploading the image : ${response.statusText}`);
    }



    // Gérer les tags : convertir la chaîne JSON en tableau

    // On ajoute la validation pour les tags le reste ne change pas
    // Gestion des tags 
    if (typeof tags !== "string") {
      throw new AppError("Tags must be a JSON string.");
    }
    const tagNamesArray = JSON.parse(tags)
    if (!Array.isArray(tagNamesArray)) {
      throw new AppError("Tags must be a valid array.");
    }


    // Promise.all est utilisé pour exécuter plusieurs promesses de manière simultanée et attendre que toutes soient résolues avant de continuer.
    // map retourne un tableau de promesses pending 
    // all est à l'écoute de leur résolution en y collant un .then
    // all reste pending tant que les promesses ne sont pas résolues
    // une fois résoluées, all resolve sur un tableau contenant les résultats de chaque promesses écoutées.
    // vrai ou faux ?

    // ChatGPT said:
    // ChatGPT
    // Vrai ! Voici une clarification détaillée pour confirmer chaque point :

    // map retourne un tableau de promesses pending :
    // ✅ Oui, lorsqu’un callback async est utilisé avec map, chaque itération retourne une promesse, ce qui forme un tableau de promesses dans l’état pending.

    // Promise.all est à l’écoute de leur résolution en y collant un .then :
    // ✅ Exact, Promise.all attache des gestionnaires then (et catch pour les rejets) à chaque promesse du tableau.

    // Promise.all reste pending tant que les promesses ne sont pas résolues :
    // ✅ Oui, la promesse retournée par Promise.all est dans l’état pending jusqu’à ce que toutes les promesses soient résolues ou qu’une d’elles soit rejetée.

    // Une fois résolues, Promise.all se résout avec un tableau contenant les résultats de chaque promesse :
    // ✅ Oui, lorsque toutes les promesses sont résolues, Promise.all se résout avec un tableau des résultats dans le même ordre que les promesses initiales.
    const tagIds = await Promise.all(tagNamesArray.map(async (tagName) => {

      const normalizedTagName = tagName.trim().toLowerCase();  // Normaliser le tag
      let tag = await Tag.findOne({ name: normalizedTagName });  // Rechercher le tag

      if (!tag) {
        tag = await Tag.create({ name: normalizedTagName, slug: slugify(normalizedTagName, { strict: true }) });  // Créer le tag si non trouvé
      }
      return tag._id;  // Retourner l'ObjectId du tag qui permettra d'utiliser populate avec ces id pour retrouver les tags associés à l'article

    }
    ));


    marked.use(
      markedHighlight({
        langPrefix: 'language-', // Préfixe pour les classes Prism
        highlight: (code, language) => {
          const validLanguage = Prism.languages[language] ? language : 'plaintext';
          return Prism.highlight(code, Prism.languages[validLanguage], validLanguage);
        },
      })
    );

    // 3. Convertir la description en HTML à partir du Markdown
    let markdownHTMLResult = marked(markdownArticle);  // Conversion du markdown en HTML

    // 4. Sanitize le HTML généré avec DOMPurify pour une sécurité maximale
    markdownHTMLResult = DOMPurify.sanitize(markdownHTMLResult);



    // 5. Créer le nouveau post avec les ObjectIds des tags et les URLs des images
    const newPost = new Post({
      title: title,
      markdownHTMLResult: markdownHTMLResult,  // Utiliser le HTML converti ici, déjà trimmed par marked
      markdownArticle: markdownArticle,  // Sauvegarde le contenu Markdown
      tags: tagIds,
      coverImageUrl: publicImageUrl, // L'URL de l'image d'origine
      author: session.userId,  // Associer l'article à l'utilisateur connecté
      slug: await generateUniqueSlug(title),

    });

    // Sauvegarder le post dans la base de données
    const savedPost = await newPost.save();

    return { success: true, slug: savedPost.slug };
  } catch (error) {

    console.error("Error while creating the post:", error)

    if (error instanceof AppError) {
      throw error
    }

    throw new Error("An error occured while creating the post")
  }
};


export const editPost = async (formData) => {
  const { slug, title, markdownArticle, coverImage, tags } = Object.fromEntries(formData);
  try {
    await connectToDB();

    // Récupérer la session utilisateur
    const session = await sessionInfo();
    if (!session.success) {
      throw new AppError("Authentication required");
    }

    // Obtenir le post existant à partir du slug
    const existingPost = await getPost(slug);
    if (!existingPost) throw new AppError("Original post not found");



    // Initialiser l'objet de mise à jour
    const updateData = {};

    // Vérifier si le titre a changé
    if (typeof title !== "string") throw new AppError("Invalid data");
    if (title.trim() !== existingPost.title) {
      updateData.title = title;
      updateData.slug = await generateUniqueSlug(title, existingPost._id);

    }

    if (typeof markdownArticle !== "string") throw new AppError("Invalid data");

    // Vérifier si la description a changé
    if (markdownArticle.trim() !== existingPost.markdownArticle) {
      updateData.markdownArticle = DOMPurify.sanitize(marked(markdownArticle)); // Convertir et sanitiser
      updateData.markdownArticle = markdownArticle;
    }

    // Gérer conditionnellement l'upload d'une nouvelle image
    if (typeof coverImage === "object" && coverImage.size > 0) {
      // Vérifier les dimensions de l'image avec sharp
      const imageBuffer = Buffer.from(await coverImage.arrayBuffer());
      const { width, height } = await sharp(imageBuffer).metadata();
      if (width > 1280 || height > 720) {
        throw new Error("Invalid data");
      }

      // Supprimer l'ancienne image si elle existe
      const fileName = existingPost.coverImageUrl.split("/").pop(); // on extrait le nom du fichier
      const deleteUrl = `${process.env.BUNNY_STORAGE_HOST}/${process.env.BUNNY_STORAGE_ZONE}/${fileName}`; // url d'appel de l'api pour destruction

      await fetch(deleteUrl, {
        method: "DELETE",
        headers: { "AccessKey": process.env.BUNNY_STORAGE_API_KEY },
      });


      // Upload de la nouvelle image vers BunnyCDN
      const uniqueFileName = `${crypto.randomUUID()}_${coverImage.name}`;
      const uploadUrl = `${process.env.BUNNY_STORAGE_HOST}/${process.env.BUNNY_STORAGE_ZONE}/${uniqueFileName}`;
      const publicImageUrl = `https://axoriablogeducation.b-cdn.net/${uniqueFileName}`;

      const response = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "AccessKey": process.env.BUNNY_STORAGE_API_KEY,
          "Content-Type": "application/octet-stream",
        },
        body: imageBuffer,
      });

      if (!response.ok) {
        throw new Error(`Error while uploading the new image : ${response.statusText}`);
      }

      updateData.coverImageUrl = publicImageUrl;
    }



    // Gérer les tags conditionnellement
    if (typeof tags !== "string") {
      throw new AppError("Invalid data.");
    }
    const tagNamesArray = JSON.parse(tags)
    if (!Array.isArray(tagNamesArray)) {
      throw new AppError("Invalid data.");
    }


    // Validation des tags
    const sortedTagsListFromDB = existingPost.tags.map(tag => tag.name).sort();
    const sortedTagsListFromForm = [...tagNamesArray].sort();

    const areTagsModified =
      existingPost.tags.length !== tagNamesArray.length ||
      !sortedTagsListFromDB.every((tag, i) => tag === sortedTagsListFromForm[i]);


    if (areTagsModified) {
      const tagIds = await Promise.all(tagNamesArray.map((tag) => findOrCreateTag(tag)));
      updateData.tags = tagIds; // Ajouter les nouveaux tags à l'objet de mise à jour
    }

    // Vérifier si des changements ont été effectués
    if (Object.keys(updateData).length === 0) {
      throw new Error("Post not modified");
    }

    // Mettre à jour l'article dans MongoDB
    console.log(existingPost.slug, updateData.slug, "jkljmj")
    const postId = existingPost._id;
    console.log(postId)
    // new: true renvoie le nouveau document, sinon ça envoie l'ancien
    const updatedPost = await Post.findByIdAndUpdate(postId, updateData, { new: true });
    console.log(updatedPost)

    // setTimeout(() => { // bug seulement en developpement
    // revalidatePath(`/article/${slug}`)
    // })
    // setTimeout(() => {

      revalidatePath(`/article/${slug}`); // Invalide l'ancien slug
    //   revalidatePath(`/article/${updatedPost.slug}`); // Force la régénération du nouveau slug
    // }, 0)

    // return { success: true, slug: updatedPost.slug };
    return { success: true, slug: updatedPost.slug };

  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    console.error(error)
    throw new Error("An error occured while updating the post")
  }
};


export async function deletePost(id) {
  try {
    await connectToDB();

    const user = await sessionInfo();
    if (!user) {
      throw new AppError("Authentication required");
    }

    const post = await Post.findById(id);
    if (!post) {
      throw new AppError("Post not found");
    }

    // 🛠️ D'abord supprimer le post en BDD
    await Post.findByIdAndDelete(id);

    // 🛠️ Ensuite, essayer de supprimer l’image si elle existe
    if (post.coverImageUrl) {
      const fileName = post.coverImageUrl.split("/").pop();
      const deleteUrl = `${process.env.BUNNY_STORAGE_HOST}/${process.env.BUNNY_STORAGE_ZONE}/${fileName}`;

      const response = await fetch(deleteUrl, {
        method: "DELETE",
        headers: { "AccessKey": process.env.BUNNY_STORAGE_API_KEY },
      });

      if (!response.ok) {
        console.error(`BunnyCDN API Error: ${response.status} - ${response.statusText}`);
        throw new AppError(`Failed to delete image: ${response.statusText}`);
      }
    }
    revalidatePath(`article/${post.slug}`)
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error(error)
    throw new Error("An error occurred while deleting the post.");
  }
}

