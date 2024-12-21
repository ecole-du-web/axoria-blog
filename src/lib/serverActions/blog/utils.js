import { Tag } from "@/lib/models/tag";

export async function findOrCreateTag(tagName) {
  const normalizedTagName = tagName.trim().toLowerCase();  // Normaliser le tag
  let tag = await Tag.findOne({ name: normalizedTagName });  // Rechercher le tag

  if (!tag) {
    tag = await Tag.create({ name: normalizedTagName });  // Créer le tag si non trouvé
  }

  return tag._id;  // Retourner l'ObjectId du tag
};

