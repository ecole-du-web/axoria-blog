import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
 // pourquoi pas rajouter ipadress et userAgent plus tard?Checkça
});


export const Session = mongoose.models?.Session || mongoose.model("Session", sessionSchema);