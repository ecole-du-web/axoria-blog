import { Post, User } from "../models/post";
import { connectToDB } from "../utils/utils";
import { unstable_noStore as noStore } from "next/cache";

export const getPosts = async () => {
  try {
    await connectToDB();
    const posts = await Post.find();
    console.log(posts)
    return posts;
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch posts!");
  }
};

export const getPost = async (slug) => {
  // Pour ne pas cacher les données par défaut (changements fréquents)
  // noStore()
  try {
    await connectToDB();
    console.log(`Fetching post with slug: ${slug}`);
    const post = await Post.findOne({ slug });
    console.log("Post retrieved:", post);
    return post;
  } catch (err) {
    console.error("Error fetching post:", err);
    throw new Error("Failed to fetch post!");
  }
};



export const getUser = async (id) => {
  noStore();
  try {
    await connectToDB();
    const user = await User.findById(id);
    return user;
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch user!");
  }
};

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





// SANS DB

// TEMPORARY DATA
// const users = [
//   { id: 1, name: "John" },
//   { id: 2, name: "Jane" },
// ];

// const posts = [
//   { id: 1, title: "Post 1", body: "......", userId: 1 },
//   { id: 2, title: "Post 2", body: "......", userId: 1 },
//   { id: 3, title: "Post 3", body: "......", userId: 2 },
//   { id: 4, title: "Post 4", body: "......", userId: 2 },
// ];

// export const getPosts = async () => {
//   return posts
// };

// export const getPost = async (id) => {
//   const post = posts.find((post) => post.id === parseInt(id))
//   return post
// };

// export const getUser = async (id) => {
//   return users.find((user) => user.id === parseInt(id))
// };

