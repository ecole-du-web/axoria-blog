import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: {
    type: Date, required: true,
    index: { expireAfterSeconds: 0 } 
  },
});


export const Session = mongoose.models?.Session || mongoose.model("Session", sessionSchema);