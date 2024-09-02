const { default: mongoose } = require("mongoose");

const connection = {};

export const connectToDB = async () => {
  if (connection.isConnected) {
    console.log("Using existing connection");
    console.log("Connected to database:", mongoose.connection.name);
    return;
  }
  try {
    const db = await mongoose.connect(process.env.MONGO, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    connection.isConnected = db.connections[0].readyState;
    console.log("Connected to MongoDB");
    console.log("Connected to database:", mongoose.connection.name);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw new Error("Failed to connect to MongoDB");
  }
};








// Sans next, obligé d'utiliser require car es6 modules pas supporté out of the box et dotenv pour analyser le .env
// const { default: mongoose } = require("mongoose");
// require('dotenv').config();

// const connection = {};
// console.log("Mongo URI:", process.env.MONGO); // Vérifie que l'URI est bien chargé

//  const connectToDB = async () => {
//   if (connection.isConnected) {
//     console.log("Using existing connection");
//     console.log("Connected to database:", mongoose.connection.name);
//     return;
//   }
//   try {
//     const db = await mongoose.connect(process.env.MONGO, {
   
//     });
//     connection.isConnected = db.connections[0].readyState;
//     console.log("Connected to MongoDB");
//     console.log("Connected to database:", mongoose.connection.name);
//   } catch (error) {
//     console.error("Error connecting to MongoDB:", error);
//     throw new Error("Failed to connect to MongoDB");
//   }
// };
// connectToDB()
