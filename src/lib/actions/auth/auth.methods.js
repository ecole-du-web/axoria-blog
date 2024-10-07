"use server";
import { connectToDB } from "@/lib/utils/utils";
import { User } from "@/lib/models/user";
import { revalidatePath } from "next/cache";
import { signIn, signOut } from "./auth";
import bcrypt from "bcryptjs"


export async function handleLogout() {
  await signOut()
}  


export const register = async (formData) => {
  console.log("ENREGISTREMENT UTILISATEUR",formData)
  const { username, email, password,  passwordRepeat } =
  Object.fromEntries(formData);
  
  if(username.length < 3) {
    return { error: "Username too short" };
  }

  // à faire en front indeed
  if (password !== passwordRepeat) {
    return { error: "Passwords do not match" };
  }

  try {
    connectToDB();

    const user = await User.findOne({ username });

    if (user) {
      return { error: "Username already exists" };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
 
    });

    await newUser.save();
    console.log("saved to db");

    return { success: true };
  } catch (err) {
    console.log(err);
    return { error: "Something went wrong!" };
  }
};

export const login = async (formData) => {
  const {username, password} = Object.fromEntries(formData)

  try {
    await signIn("credentials",  {
      redirect: false, // Empêche la redirection automatique
      username,
      password,
    })
    return {success: true, error: false}
  } catch(e) {
    console.error('Unexpected error:', e);
    return  {success: false, error: true}
  }
}