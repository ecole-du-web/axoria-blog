import mongoose from "mongoose";

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true, // Peut être redondant si `normalizeText` le gère
    index: true,// Sous le capot, MongoDB utilise des structures de données (comme des arbres B-trees) pour organiser les valeurs indexées, permettant des recherches bien plus rapides. Oui, c'est courant et recommandé pour tous les champs fréquemment recherchés (comme slug ou userId). Cela optimise considérablement les performances des requêtes.
  },
  slug: {
    type: String,
    unique: true,
  },
});

// Middleware pour normaliser le `name` et générer le `slug`
// tagSchema.pre("save", function (next) {
//   if (!this.slug) { // Vérifie que le document est en cours de création, pour juste executer ça la première fois
//     this.slug = normalizeText(this.name); // Génère le slug uniquement à la création
//   }
//   next();
// });

// Cette structure permet d’éviter l’erreur : "Cannot overwrite Tag model once compiled", courante dans les environnements où les modules sont rechargés dynamiquement.
export const Tag = mongoose.models?.Tag || mongoose.model("Tag", tagSchema);