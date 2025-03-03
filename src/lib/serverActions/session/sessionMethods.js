"use server";

import { User } from "@/lib/models/user";
import { Session } from "@/lib/models/session";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers"; // Pour définir des cookies HTTP-only
import { connectToDB } from "@/lib/utils/db/connectToDB";
import slugify from "slugify";
import AppError from "@/lib/utils/errorHandling/customError";


export async function register(formData) {
  const { userName, email, password, passwordRepeat } = Object.fromEntries(formData);


  try {

    if (typeof userName !== "string" || userName.trim().length < 3) {
      throw new AppError("Username must be at least 3 characters long.");
    }

    if (typeof password !== "string" || password.trim().length < 6) {
      throw new AppError("Password must be at least 6 characters long.");
    }

    // ✅ Vérification du format d'email
    //   ^	Début de la chaîne (oblige à commencer directement par un caractère valide).
    // [^\s@]+	Un ou plusieurs (+) caractères qui ne sont ni un espace (\s) ni un @ (assure un texte avant @).
    // @	Le @ obligatoire (sépare l'utilisateur et le domaine).
    // [^\s@]+	Encore un texte valide après @ (assure un domaine sans espaces ni @).
    // \.	Le . obligatoire (sépare le domaine et l'extension).
    // [^\s@]+	L'extension du domaine (ex: com, fr, org), sans espaces ni @.
    // $	Fin de la chaîne (évite les caractères invalides après l'extension).

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof email !== "string" || !emailRegex.test(email.trim())) {
      throw new Error("Invalid email format.");
    }

    await connectToDB();

    // ✅ Vérifier si `userName` OU `email` existent déjà
    const existingUser = await User.findOne({
      $or: [{ userName }, { email }]
    });

    if (existingUser) {
      throw new AppError(
        existingUser.userName === userName
          ? "Username already exists"
          : "Email already exists"
      );
    }

    // Version normalisée pour les URLS/utilisation dans les autres server actions (getPostsByAuthor)
    // const normalizedUserName = normalizeText(userName); //enlève car utilisé qu'une fois ?
    const normalizedUserName = slugify(userName, { lower: true, strict: true })

    // génère un "sel" (un code aléatoire unique pour chaque utilisateur ou mot de passe)
    const salt = await bcrypt.genSalt(10);
    // Le sel est combiné au mot de passe pour créer un hachage unique.
    // $2b$10$N9qo8uLOickgx2ZMRZo5i.ei4D/OflkDszO8NqP1BTksk4KRZ1Qfu
    // Ce code contient des parties spéciales
    // $2b$ : Version de l'algorithme utilisé (ici bcrypt v2b).
    // 10$ : Nombre de "salt rounds" (le facteur de complexité utilisé pour calculer le sel et le hachage).
    // N9qo8uLOickgx2ZMRZo5i. : Le sel généré de manière aléatoire.
    // ei4D/OflkDszO8NqP1BTksk4KRZ1Qfu : Le hachage du mot de passe, basé sur le mot de passe et le sel.

    // Puis lors de la compairaison : Exactement, bcrypt compare en recréant un hachage à partir du mot de passe fourni et le compare au hachage stocké, mais il ne peut jamais revenir au mot de passe original.
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      userName,
      normalizedUserName,
      email,
      password: hashedPassword,
    });

    await newUser.save();


    // Retournez un succès sans essayer de connecter l'utilisateur
    return { success: true };
  }
  catch (error) {

    console.error("Error while signing up:", error)

    if (error instanceof AppError) {
      throw error
    }

    throw new Error("Error while signing up:")
  }
};



// Fonction de login
export async function login(formData) {
  const userName = formData.get("userName")
  const password = formData.get("password")

  try {
    if (typeof userName !== "string") {
      throw new AppError("Invalid input format");
    }

    if (typeof password !== "string") {
      throw new AppError("Invalid input format");
    }

    await connectToDB()

    const user = await User.findOne({ userName })
    if (!user) {
      throw new AppError("Invalid credentials")
    }
    // 🔹 Il re-hash le mot de passe fourni avec les mêmes paramètres (algorithme, coût, sel).
    // 🔹 Puis, il compare simplement si les deux hashes sont identiques.
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new AppError("Invalid credentials")
    }

    let session;
    const existingSession = await Session.findOne({
      userId: user._id,
      expiresAt: { $gt: new Date() }
    })

    if (existingSession) {
      session = existingSession
      existingSession.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await existingSession.save();
    }
    else {
      session = new Session({
        userId: user._id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      })
      await session.save()
    }

    const cookieStore = await cookies()
    cookieStore.set("sessionId", session._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      sameSite: "Lax" // Attaques CSRF // ça bloque l'envoi des cookies vers d'autre domaine que le domaine ouvert sur le navigateur
    })

    return { success: true, userId: user._id.toString() }

  }
  catch (error) {

    console.error("Error while signing in:", error)

    if (error instanceof AppError) {
      throw error
    }

    throw new Error("Error while signing in:")
  }
};




// Fonction de logOut
export async function logOut() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;


  try {
    // Supprime la session de la base de données
    await Session.findByIdAndDelete(sessionId);

    // Supprime le cookie sessionId
    cookieStore.set("sessionId", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0, // Supprime immédiatement le cookie
      sameSite: "strict",
    });

    return { success: true }; // Confirme le logOut
  } catch (error) {
    console.error(error)
  }
}


// créer un fichier privateRoutes dans utils/general/xxx
export async function isPrivatePage(pathname) {
  const privateSegments = ["/dashboard", "/settings/profile"];
  // ducoup deux cas possible avec le second segment :
  // on est à ndd/settings/profile donc pathname === segment
  // soit on est par exemple à ndd/settings/progile/xyz et donc pathname.startsWith(segment + "/")

  return privateSegments.some(segment =>
    pathname === segment || pathname.startsWith(segment + "/") // Pour éviter /dashboard-settings par ex qui serait compté comme privé
  );
}



export async function SASessionInfo() {
  // Lire le cookie 'sessionId'
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;
  if (!sessionId) {
    return { success: false };
    // Pas de session, donc pas d'utilisateur connecté
  }


  await connectToDB()

  // Vérifier la session dans la base de données
  const session = await Session.findById(sessionId);
  console.log(sessionId)
  if (!session || session.expiresAt < new Date()) {
    return { success: false };
    // Session invalide ou expirée
  }

  // Charger l'utilisateur lié à la session
  const user = await User.findById(session.userId);

  if (!user) {
    return { success: false };
  }
  console.log({ success: true, userId: user._id.toString() })

  return { success: true, userId: user._id.toString() };

}
