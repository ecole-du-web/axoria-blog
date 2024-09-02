import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      min: 3,
      max: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      max: 50,
    },
    password: {
      type: String,
    },
    img: {
      type: String,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Si le modèle User existe déjà dans mongoose.models, alors User sera égal à ce modèle existant.
// Si le modèle User n'existe pas encore, il sera créé en utilisant mongoose.model("User", userSchema).
export const User = mongoose.models?.User || mongoose.model("User", userSchema);