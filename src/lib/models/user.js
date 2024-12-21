import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userName: { type: String, required: true, unique: true },
  normalizedUserName: { type: String, required: true, unique: true }, // Nouveau champ pour le nom normalisé
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
});



export const User = mongoose.models?.User || mongoose.model("User", userSchema);