"use server";
import { connectToDB } from "../utils/utils";
import { Post } from "../models/post";
import { Tag } from "../models/tag";  // Importer correctement le modèle Tag
import { revalidatePath } from "next/cache";
// import { signIn, signOut } from "./auth"
// import bcrypt from "bcryptjs"

export const addPost = async (formData) => {
  console.log("Received formData", formData);
  
  const { title, desc, tags } = Object.fromEntries(formData);  // Extraire les données du formulaire
  
  try {
    // Connexion à la base de données
    connectToDB();

    // Gérer les tags : convertir la chaîne JSON en tableau
    const tagNamesArray = JSON.parse(tags);  // Parse la chaîne de caractères en tableau ['css', 'javascript']
    const tagIds = await Promise.all(tagNamesArray.map(tag => findOrCreateTag(tag)));  // Trouver ou créer chaque tag

    // Créer le nouveau post avec les ObjectIds des tags
    const newPost = new Post({
      title,
      desc,
      tags: tagIds  // Associer les ObjectIds des tags au post
    });

    // Sauvegarder le post dans la base de données
    await newPost.save();

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