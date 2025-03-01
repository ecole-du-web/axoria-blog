import { Types } from "mongoose"; // Import des types Mongoose
import slugify from "slugify";
import { Post } from "@/lib/models/post"; // Assure-toi que l'import du modèle est correct

export function serializeMongoData(data) {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    value instanceof Types.ObjectId ? value.toString() : value
  ));
}

export async function generateUniqueSlug(title, postId = null) {
  let slugCandidate = slugify(title, { lower: true, strict: true });

  // not equal juste pour les majs, pour éviter de trouver le même post
  let slugExists = await Post.findOne({ slug: slugCandidate, _id: { $ne: postId } });

  let counter = 1;
  while (slugExists) {
    slugCandidate = `${slugCandidate}-${counter}`;
    slugExists = await Post.findOne({ slug: slugCandidate, _id: { $ne: postId } });
    counter++;
  }

  return slugCandidate;
};