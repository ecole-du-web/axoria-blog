"use server";
import { connectToDB } from "../utils/utils";
import { Post } from "../models/post";
import { Tag } from "../models/tag";  // Importer correctement le modèle Tag
import { revalidatePath } from "next/cache";
// import { signIn, signOut } from "./auth"
// import bcrypt from "bcryptjs"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

import { storage } from "@/lib/utils/firebase"; // Importer Firebase Storage
import sharp from "sharp"
// Récupère le cookie et les données de session
import { auth } from "./auth/auth";
import { marked } from 'marked';  // Import de la bibliothèque marked
// import sanitizeHtml from 'sanitize-html'; // Pour nettoyer le HTML
import { getPost } from "./dataActions";

import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';
import mongoose from "mongoose";


// Créer un DOM simulé pour DOMPurify côté serveur
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);


export const addPost = async (formData) => {
  const { title, desc, tags } = Object.fromEntries(formData);
  try {
    // Connexion à la base de données
    connectToDB();

    // Récupérer la session pour obtenir l'ID de l'utilisateur connecté
    const session = await auth();
    console.log("SESSSSSSSSSSSSSSSSSSSSSSSSION", session)
    const userId = session?.user?.id;  // Associer l'ID utilisateur

    if (!userId) {
      throw new Error("Utilisateur non authentifié");
    }


    // 1. Gérer l'upload de l'image
    const imageFile = formData.get("coverImage");
    let originalImageUrl = "";
    let thumbnailUrl = "";

    if (imageFile && imageFile.size > 0) {
      try {
        const imageBuffer = Buffer.from(await imageFile.arrayBuffer());

        // Sauvegarder l'image originale
        const originalImageRef = ref(storage, `images/originals/${imageFile.name}`);
        const originalSnapshot = await uploadBytes(originalImageRef, imageBuffer);
        originalImageUrl = await getDownloadURL(originalSnapshot.ref);

        // Créer une version réduite (thumbnail) avec sharp
        const thumbnailBuffer = await sharp(imageBuffer)
          .resize(320, 180) // Redimensionner à 320x180
          .toBuffer();

        // Sauvegarder l'image redimensionnée (thumbnail)
        const thumbnailImageRef = ref(storage, `images/thumbnails/${imageFile.name}`);
        const thumbnailSnapshot = await uploadBytes(thumbnailImageRef, thumbnailBuffer);
        thumbnailUrl = await getDownloadURL(thumbnailSnapshot.ref);

        console.log("Images uploaded successfully:", originalImageUrl, thumbnailUrl);
      } catch (uploadError) {
        console.error("Erreur lors de l'upload de l'image :", uploadError);
        throw new Error("Image upload failed.");
      }
    }

    // Gérer les tags : convertir la chaîne JSON en tableau
    const tagNamesArray = JSON.parse(tags);
    const tagIds = await Promise.all(tagNamesArray.map(tag => findOrCreateTag(tag)));


    // 3. Convertir la description en HTML à partir du Markdown
    let descHtml = marked(desc);  // Conversion du markdown en HTML

    // 4. Sanitize le HTML généré avec DOMPurify pour une sécurité maximale
    descHtml = DOMPurify.sanitize(descHtml);


    // Créer le nouveau post avec les ObjectIds des tags et les URLs des images
    const newPost = new Post({
      title,
      desc: descHtml,  // Utiliser le HTML converti ici
      markdown: desc, // Sauvegarde le contenu Markdown
      tags: tagIds,
      coverImageUrl: originalImageUrl, // L'URL de l'image d'origine
      thumbnailUrl, // L'URL de la version redimensionnée
      author: userId,  // Associer l'article à l'utilisateur connecté
    });

    // Sauvegarder le post dans la base de données
    const savedPost = await newPost.save();
    console.log("Post sauvegardé avec succès :", savedPost); // Vérifie si `author` est bien sauvegardé

    // Revalider le cache
    revalidatePath("/blog");
    revalidatePath("/dashboard");
  } catch (err) {
    console.log("Erreur lors de la création du post :", err);
  }
};


export const editPost = async (formData) => {
  const { slug, title, desc, coverImage, tags } = Object.fromEntries(formData);

  try {
    connectToDB();

    // Obtenir le post existant à partir du slug
    const existingPost = await getPost(slug);
    if (!existingPost) throw new Error("Article non trouvé");

    // Utiliser l'ID du post existant pour la mise à jour
    const postId = existingPost._id;

    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      throw new Error("Utilisateur non authentifié");
    }

    // Utiliser les URLs existantes par défaut
    let newCoverImageUrl = existingPost.coverImageUrl;
    let newThumbnailUrl = existingPost.thumbnailUrl;

    // Vérifier et gérer l'upload d'une nouvelle image
    if (coverImage.size !== 0) {
      if (existingPost.coverImageUrl) {
        const oldCoverImageRef = ref(storage, existingPost.coverImageUrl);
        await deleteObject(oldCoverImageRef);
      }
      if (existingPost.thumbnailUrl) {
        const oldThumbnailRef = ref(storage, existingPost.thumbnailUrl);
        await deleteObject(oldThumbnailRef);
      }

      const imageBuffer = Buffer.from(await coverImage.arrayBuffer());
      const originalImageRef = ref(storage, `images/originals/${coverImage.name}`);
      const originalSnapshot = await uploadBytes(originalImageRef, imageBuffer);
      newCoverImageUrl = await getDownloadURL(originalSnapshot.ref);

      const thumbnailBuffer = await sharp(imageBuffer).resize(320, 180).toBuffer();
      const thumbnailImageRef = ref(storage, `images/thumbnails/${coverImage.name}`);
      const thumbnailSnapshot = await uploadBytes(thumbnailImageRef, thumbnailBuffer);
      newThumbnailUrl = await getDownloadURL(thumbnailSnapshot.ref);
    }





    // les données du client sont en json car objet à transformer en chaine pour passer
    const tagNamesArray = JSON.parse(tags);

    const tagsChanged = existingPost.tags.length !== tagNamesArray.length ||
      !existingPost.tags.every(name => tags.includes(name));




    if (tagsChanged) {

      // Maj des tags seulement si changement 
      // Gérer les tags : convertir la chaîne JSON en tableau
      // Créer les potentiels nouveaux objectID ou ne fait rien
      const tagIds = await Promise.all(tagNamesArray.map(tag => findOrCreateTag(tag)));

      // Création d'un nouveau tableau qui vient supprimer tout ce qu'il avait précedemment
      // Remplacer les tags de l'article par la nouvelle liste d'ObjectId
      await Post.findByIdAndUpdate(postId, { tags: tagIds }, { new: true });
      console.log("ICIIIIIIIIIIIIII", tagsChanged, existingPost.tags, JSON.parse(tags))
    }



    // Convertir et sanitiser la description en HTML
    let descHtml = marked(desc);
    descHtml = DOMPurify.sanitize(descHtml);

    // Mettre à jour l'article dans MongoDB
    console.log("ID DU POST A UPDATE:", postId);
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        title,
        desc: descHtml,
        markdown: desc, // Sauvegarde le contenu Markdown
        coverImageUrl: newCoverImageUrl,
        thumbnailUrl: newThumbnailUrl,
      },
      { new: true }
    );

    console.log("Post mis à jour avec succès :", updatedPost);
    revalidatePath("/blog");
    revalidatePath("/dashboard");
    revalidatePath("/edit/eazeaze");

  } catch (err) {
    console.log("Erreur lors de l'édition de l'article :", err);
  }
};





const findOrCreateTag = async (tagName) => {
  const normalizedTagName = tagName.trim().toLowerCase();  // Normaliser le tag
  let tag = await Tag.findOne({ name: normalizedTagName });  // Rechercher le tag

  if (!tag) {
    tag = await Tag.create({ name: normalizedTagName });  // Créer le tag si non trouvé
  }

  return tag._id;  // Retourner l'ObjectId du tag
};





export const deletePost = async (formData) => {
  "use server" // tu peux le mettre une fois en haut du fichier

  const { id } = Object.fromEntries(formData)


  try {
    connectToDB()

    await Post.findByIdAndDelete(id)
    console.log("Deleted from DB")
    revalidatePath("/blog")
  } catch (err) {
    console.log(err)
  }

}


export async function handleGithubLogin() {
  await signIn("github")
}


export async function handleLogout() {
  await signOut()
}


export const register = async (formData) => {
  "use server"
  console.log("FORMDATA", formData)
  const { username, email, password, passwordRepeat } =
    Object.fromEntries(formData);

  if (username.length < 3) {
    return { error: "Username too short" };
  }

  // à faire en front indeed
  if (password !== passwordRepeat) {
    return { error: "Passwords do not match" };
  }

  try {
    connectToDB();

    const user = await User.findOne({ username });

    if (user) {
      return { error: "Username already exists" };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,

    });

    await newUser.save();
    console.log("saved to db");

    return { success: true };
  } catch (err) {
    console.log(err);
    return { error: "Something went wrong!" };
  }
};

export const login = async (formData) => {
  const { username, password } = Object.fromEntries(formData)

  try {
    await signIn("credentials", {
      redirect: false, // Empêche la redirection automatique
      username,
      password,
    })
    return { success: true, error: false }
  } catch (e) {
    console.error('Unexpected error:', e);
    return { success: false, error: true }
  }
}