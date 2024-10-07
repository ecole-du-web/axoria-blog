"use server";
import { connectToDB } from "../utils/utils";
import { Post } from "../models/post";
import { Tag } from "../models/tag";  // Importer correctement le modèle Tag
import { revalidatePath } from "next/cache";
// import { signIn, signOut } from "./auth"
// import bcrypt from "bcryptjs"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/utils/firebase"; // Importer Firebase Storage
import sharp from "sharp"
// Récupère le cookie et les données de session
import { auth } from "./auth/auth";

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

    // Créer le nouveau post avec les ObjectIds des tags et les URLs des images
    const newPost = new Post({
      title,
      desc,
      tags: tagIds,
      coverImageUrl: originalImageUrl, // L'URL de l'image d'origine
      thumbnailUrl, // L'URL de la version redimensionnée
      author: userId,  // Associer l'article à l'utilisateur connecté

    });

    // Sauvegarder le post dans la base de données
    const savedPost  = await newPost.save();
    console.log("Post sauvegardé avec succès :", savedPost); // Vérifie si `author` est bien sauvegardé

    // Revalider le cache
    revalidatePath("/blog");
  } catch (err) {
    console.log("Erreur lors de la création du post :", err);
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

  const {id} = Object.fromEntries(formData) 


  try {
    connectToDB()

    await Post.findByIdAndDelete(id)
    console.log("Deleted from DB")
    revalidatePath("/blog")
  } catch(err) {
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
  console.log("FORMDATA",formData)
  const { username, email, password,  passwordRepeat } =
  Object.fromEntries(formData);

  if(username.length < 3) {
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
  const {username, password} = Object.fromEntries(formData)

  try {
    await signIn("credentials",  {
      redirect: false, // Empêche la redirection automatique
      username,
      password,
    })
    return {success: true, error: false}
  } catch(e) {
    console.error('Unexpected error:', e);
    return  {success: false, error: true}
  }
}