"use server"
import { connectToDB } from "@/lib/utils/db/connectToDB";
import { User } from "@/lib/models/user";
// import mongoose from "mongoose";
import { unstable_noStore as noStore } from "next/cache";
import { Post } from "@/lib/models/post";

// ???
export async function getUser(id) {
  noStore(); // ?
  try {
    await connectToDB();
    const user = await User.findById(id);
    return user;
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch user!");
  }
};

// ???
export const getUsers = async () => {
  try {
    await connectToDB();
    const users = await User.find();
    return users;
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch users!");
  }
};



