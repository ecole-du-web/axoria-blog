"use server"

import { Post } from "@/lib/models/post";
import { connectToDB } from "../../utils/connectToDB";
import { revalidatePath, revalidateTag } from "next/cache";
import { ref, uploadBytes, getDownloadURL, deleteObject, getStorage } from "firebase/storage";
import { storage } from "@/lib/utils/firebase"; // Importer Firebase Storage
import sharp from "sharp"
import { marked } from 'marked';  // Import de la bibliothèque marked
import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';
import { getPost } from "@/lib/server/blog/postMethods";
import { sessionInfo } from "../../server/session/sessionMethods";
import { findOrCreateTag } from "./utils";


// Créer un DOM simulé pour DOMPurify côté serveur
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);


export const addPost = async (formData) => {
  const { title, markdownArticle, tags } = Object.fromEntries(formData);

  try {
    // Connexion à la base de données
    connectToDB();

    // Récupérer la session utilisateur
    const user = await sessionInfo();
    if (!user) {
      throw new Error("Utilisateur non authentifié");
    }

    // 1. Gérer l'upload de l'image
    const imageFile = formData.get("coverImage");
    let originalImageUrl = "";

    if (imageFile) {
      const imageBuffer = Buffer.from(await imageFile.arrayBuffer());

      // Vérifier les dimensions de l'image avec sharp
      const { width, height } = await sharp(imageBuffer).metadata();
      if (width > 1280 || height > 720) {
        throw new Error("Image exceeds 1280x720 dimensions.");
      }


      // Générer un nom unique pour l'image
      const uniqueFileName = `${crypto.randomUUID()}_${imageFile.name}`;

      // Sauvegarder l'image originale
      const originalImageRef = ref(storage, `images/featured/${uniqueFileName}`); // Dans notre storage(var storage), stoque à l'url donné, retourne simplement un objet à utiliser pour enregistrer l'image
      const originalSnapshot = await uploadBytes(originalImageRef, imageBuffer); // Enregistre l'image
      originalImageUrl = await getDownloadURL(originalSnapshot.ref); // obtiens l'URL

      console.log("Image uploaded successfully:", originalImageUrl);
    } else {
      throw new Error("Image upload failed.");
    }

    // Gérer les tags : convertir la chaîne JSON en tableau
    const tagNamesArray = JSON.parse(tags);
    const tagIds = await Promise.all(tagNamesArray.map(tag => findOrCreateTag(tag)));

    // 3. Convertir la description en HTML à partir du Markdown
    let markdownHTMLResult = marked(markdownArticle);  // Conversion du markdown en HTML

    // 4. Sanitize le HTML généré avec DOMPurify pour une sécurité maximale
    markdownHTMLResult = DOMPurify.sanitize(markdownHTMLResult);

    // 5. Créer le nouveau post avec les ObjectIds des tags et les URLs des images
    const newPost = new Post({
      title,
      markdownHTMLResult: markdownHTMLResult,  // Utiliser le HTML converti ici
      markdownArticle: markdownArticle,  // Sauvegarde le contenu Markdown
      tags: tagIds,
      coverImageUrl: originalImageUrl, // L'URL de l'image d'origine
      author: user._id,  // Associer l'article à l'utilisateur connecté
    });

    // Sauvegarder le post dans la base de données
    const savedPost = await newPost.save();
    console.log("Post sauvegardé avec succès :", savedPost);
    // Revalider le cache
    // revalidatePath("/blog");
    // revalidatePath("/");
    // revalidatePath("/dashboard");
    // revalidateTag("posts")
    // revalidateTag("tags")
    return { success: true, slug: savedPost.slug };
  } catch (err) {
    console.error("Error while creating the post:", err);
    throw new Error(err.message || "An error occurred while creating the post.");
  }
};

export const editPost = async (formData) => {
  const { slug, title, markdownArticle, coverImage, tags } = Object.fromEntries(formData);
  console.log("ELEMENTS", Object.fromEntries(formData))
  try {
    connectToDB();

    const user = await sessionInfo();
    if (!user) {
      throw new Error("Utilisateur non authentifié");
    }

    // Obtenir le post existant à partir du slug
    const existingPost = await getPost(slug);
    if (!existingPost) throw new Error("Article non trouvé");
    const postId = existingPost._id;



    // Initialiser l'objet de mise à jour
    const updateData = {};

    // Vérifier si le titre a changé
    if (title && title !== existingPost.title) {
      updateData.title = title;
    }

    // Vérifier si la description a changé
    if (markdownArticle !== existingPost.markdownArticle) {
      updateData.markdownArticle = DOMPurify.sanitize(marked(markdownArticle)); // Convertir et sanitiser
      updateData.markdownArticle = markdownArticle;
    }

    // Gérer conditionnellement l'upload d'une nouvelle image
    // Toute image upload entrainera l'écrasement et la création d'une nouvelle image
    if (coverImage.size !== 0) {
      // Vérifier les dimensions de l'image avec sharp
      const imageBuffer = Buffer.from(await coverImage.arrayBuffer());
      const { width, height } = await sharp(imageBuffer).metadata();
      if (width > 1280 || height > 720) {
        throw new Error("Image exceeds 1280x720 dimensions.");
      }
      if (existingPost.coverImageUrl) {
        const oldCoverImageRef = ref(storage, existingPost.coverImageUrl);
        await deleteObject(oldCoverImageRef);
      }



      // Upload de la nouvelle image
      const uniqueFileName = `${crypto.randomUUID()}_${coverImage.name}`;
      const originalImageRef = ref(storage, `images/featured/${uniqueFileName}`);
      const originalSnapshot = await uploadBytes(originalImageRef, imageBuffer);
      const newCoverImageUrl = await getDownloadURL(originalSnapshot.ref);

      // Ajouter l'URL de la nouvelle image dans l'objet de mise à jour
      updateData.coverImageUrl = newCoverImageUrl;
    }

    // Gérer les tags conditionnellement
    const tagNamesArray = JSON.parse(tags);
    const tagsChanged =
      existingPost.tags.length !== tagNamesArray.length ||
      !existingPost.tags.every((tag) => tagNamesArray.includes(tag));

    if (tagsChanged) {
      const tagIds = await Promise.all(tagNamesArray.map((tag) => findOrCreateTag(tag)));
      updateData.tags = tagIds; // Ajouter les nouveaux tags à l'objet de mise à jour
    }

    // Vérifier si des changements ont été effectués
    if (Object.keys(updateData).length === 0) {
      throw new Error("Post not modified");
    }

    // Mettre à jour l'article dans MongoDB
    // new: true renvoie le nouveau document, sinon ça envoie l'ancien
    const updatedPost = await Post.findByIdAndUpdate(postId, updateData, { new: true });

    console.log("Post mis à jour avec succès :", updatedPost);

    // Revalider les caches
    revalidatePath("/blog");
    revalidatePath("/dashboard");
    revalidatePath("/categories");
    revalidatePath(`/article/${slug}`);
    revalidateTag("posts")
    revalidateTag("tags")


    return { success: true, slug: updatedPost.slug };

  } catch (err) {
    throw new Error(err.message);
  }
};


export const deletePost = async (formData) => {
  const { id } = Object.fromEntries(formData);
  await connectToDB();

  const user = await sessionInfo();
  if (!user) {
    throw new Error("Utilisateur non authentifié");
  }
  const post = await Post.findById(id);
  console.log("eee", post)
  const imageUrl = post.coverImageUrl;
  const storage = getStorage(); // instance de notre storage 
  const imageRef = ref(storage, imageUrl); // Utilise le chemin Firebase relatif si nécessaire

  await deleteObject(imageRef);

  await Post.findByIdAndDelete(id);
  console.log("deleted from db");

  // à voir mais mets à jour automatiquement meme si on est sur la pge, plus pratique qu'un redirect mais trop documenté.
  revalidatePath("/dashboard");
  revalidateTag("posts");
  revalidateTag("tags");
  // redirect("/dashboard");

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
