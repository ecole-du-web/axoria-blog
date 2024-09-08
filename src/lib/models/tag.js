import mongoose from "mongoose";

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,        // Supprime les espaces inutiles avant et après
    lowercase: true,   // Convertit le tag en minuscules
    unique: true       // Assure que chaque tag est unique
  }
});

export const Tag = mongoose.models?.Tag || mongoose.model("Tag", tagSchema);
