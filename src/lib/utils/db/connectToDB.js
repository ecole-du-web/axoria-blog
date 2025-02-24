import mongoose from "mongoose";

export async function connectToDB() {
  if (mongoose.connection.readyState) {
    console.log("Using existing connection:", mongoose.connection.name);
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO); // Supprimer les options dépréciées
    console.log("Connected to database:", mongoose.connection.name);
  } catch (error) {
    throw new Error("Failed to connect to the Database");
  }
}