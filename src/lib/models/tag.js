import mongoose from "mongoose";

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,        // Supprime les espaces inutiles avant et après
    lowercase: true,   // Convertit le tag en minuscules
    unique: true,       // Assure que chaque tag est unique
    index: true // Sous le capot, MongoDB utilise des structures de données (comme des arbres B-trees) pour organiser les valeurs indexées, permettant des recherches bien plus rapides. Oui, c'est courant et recommandé pour tous les champs fréquemment recherchés (comme slug ou userId). Cela optimise considérablement les performances des requêtes.
  }
});

// Explique ça? pourquoi ce ou et ces ?
export const Tag = mongoose.models?.Tag || mongoose.model("Tag", tagSchema);
