import { cookies } from "next/headers";
import { Session } from "@/lib/models/session";
import { User } from "@/lib/models/user";
import { connectToDB } from "@/lib/utils/db/connectToDB";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // Lire le cookie 'sessionId'
    const sessionId = req.headers.get("cookie")?.split("; ")
    .find((c) => c.startsWith("sessionId="))
    ?.split("=")[1];
  
  console.log("HERE ZZZ - Session ID:", sessionId);
  

    if (!sessionId) {
      return NextResponse.json({ authorized: false });
    }

    // Connexion à la BDD
    await connectToDB();

    // Vérifier si la session existe et n'est pas expirée
    const session = await Session.findById(sessionId);
    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ authorized: false });
    }

    // Vérifier si l'utilisateur lié à la session existe
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ authorized: false });
    }

    // ✅ L'utilisateur est authentifié
    return NextResponse.json({ authorized: true, userId: user._id.toString() });

  } catch (error) {
    console.error("Error validating session:", error);
    return NextResponse.json({ authorized: false }, { status: 500 });
  }
}
