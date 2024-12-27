const { default: mongoose } = require("mongoose");

const connection = {};

export const connectToDB = async () => {
  if (connection.isConnected) {
    console.log("Using existing connection");
    console.log("Connected to database:", mongoose.connection.name);
    return;
  }
  try {
    const db = await mongoose.connect(process.env.MONGO); // Supprimer les options dépréciées
    connection.isConnected = db.connections[0].readyState;
    console.log("Connected to MongoDB");
    console.log("Connected to database:", mongoose.connection.name);
  } catch (error) {
    throw new Error("Failed to connect to the Database");
  }
};