import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
});

// Réutilise le modèle si déjà défini, sinon crée-le, check pourquoi il faut ce ? à tout prix.
export const User = mongoose.models?.User || mongoose.model("User", userSchema);