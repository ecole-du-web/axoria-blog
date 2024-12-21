"use server"
import { Post } from "@/lib/models/post";
import { connectToDB } from "../../utils/connectToDB";
import { revalidatePath } from "next/cache";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/lib/utils/firebase"; // Importer Firebase Storage
import sharp from "sharp"
import { marked } from 'marked';  // Import de la bibliothèque marked
import { findOrCreateTag } from "./utils";
import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';
import mongoose from "mongoose";
import { sessionInfo } from "../../server/session/sessionMethods";


// Créer un DOM simulé pour DOMPurify côté serveur
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);


export const addPost = async (formData) => {
  const { title, desc, tags } = Object.fromEntries(formData);
  try {
    // Connexion à la base de données
    connectToDB();

    // Récupérer la session utilisateur avec ton système
    const user = await sessionInfo();
    if (!user) {
      throw new Error("Utilisateur non authentifié");
    }

    const userId = new mongoose.Types.ObjectId(user._id);
    console.log("User connecté :", userId);


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
    return { success: true, slug: savedPost.slug };
  } catch (err) {
    console.log("Erreur lors de la création du post :", err);
  }
};

export const getPosts = async () => {
  try {
    await connectToDB();
    const posts = await Post.find({})
      .populate("author", "userName normalizedUserName") // Peupler `author` avec seulement `userName`
      .select("title coverImageUrl thumbnailUrl slug createdAt updatedAt"); // Sélectionner les champs nécessaires

    return posts;
  } catch (err) {
    console.error("Error fetching posts:", err);
    throw new Error("Failed to fetch posts!");
  }
};


export const getPost = async (slug) => {
  try {
    await connectToDB();
    console.log(`Fetching post with slug: ${slug}`);

    // Récupérer l'objet Mongoose
    // Il faut import Tag quand on populate
    // select s'applique au modèle principal ici POST, et populate aux documents d'un autre modèle lié.
    // Ex : const post = await Post.findOne({ slug })
    // .select("title content")  // Champs du modèle Post
    // .populate("tags", "name description"); // Champs du modèle Tag
    const post = await Post.findOne({ slug })
      .populate({
        path: "author", // Enrichit l'objet `author`
        select: "userName normalizedUserName", // Inclut les champs nécessaires depuis User
      })
      .populate({
        path: "tags",
        select: "name", // Inclut le champ `name` depuis Tag
      });

    console.log("Post enrichi :", post);
    // On utilise populate ici car author et tags sont des références (ObjectId) à d'autres collections. populate permet d'enrichir ces références avec leurs données. À l'inverse, select est utilisé pour limiter les champs directement sur le document principal (ici Post). Donc, pour les sous-documents référencés, populate avec un sélecteur est nécessaire.


    if (!post) return null;

    // Convertir l'objet en un objet simple

    // c'est différent d'avec getPosts car : lean() : Quand vous utilisez .lean() sur une requête Mongoose (ou implicitement dans des méthodes de récupération multiples), les documents retournés ne sont pas des objets Mongoose enrichis mais des objets JavaScript purs. Cela signifie qu'ils n'ont pas les méthodes et les propriétés supplémentaires que Mongoose ajoute, rendant inutile l'appel de toObject().
    const plainPost = post.toObject();
    // Conversion explicite des champs nécessaires
    return {
      ...plainPost,
      author: post.author.userName, // Exemple: inclure seulement le nom de l'auteur car sinon bug not plain object
      normalizedUserName: post.author.normalizedUserName,

      _id: plainPost._id.toString(), // Convertir ObjectId en chaîne
      tags: plainPost.tags.map(tag => ( // On ne garde que le nom qui est unique, pas besoin de prendre l'_id implicitement retourné par populate.
        tag.name           // Nom du tag
      )), // Convertir chaque tag ObjectId en chaîne
      createdAt: plainPost.createdAt.toISOString(), // Convertir date en chaîne ISO
      updatedAt: plainPost.updatedAt.toISOString(), // Convertir date en chaîne ISO
    };
  } catch (err) {
    console.error("Error fetching post:", err);
    throw new Error("Failed to fetch post!");
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


export const deletePost = async (formData) => {
  const { id } = Object.fromEntries(formData);

  try {
    await connectToDB();

    await Post.findByIdAndDelete(id);
    console.log("deleted from db");
    // à voir mais mets à jour automatiquement meme si on est sur la pge, plus pratique qu'un redirect mais trop documenté.
    revalidatePath("/dashboard");
    // redirect("/dashboard");
  } catch (err) {
    console.log(err);
    return { error: "Something went wrong!" };
  }
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
