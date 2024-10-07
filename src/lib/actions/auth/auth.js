import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectToDB } from "@/lib/utils/utils"
import { User } from "@/lib/models/user"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"

const authenticateUser = async (credentials) => {
  try {
    connectToDB();
    const user = await User.findOne({ username: credentials.username });

    if (!user) throw new Error("Wrong credentials!");

    const isPasswordCorrect = await bcrypt.compare(
      credentials.password,
      user.password
    );

    if (!isPasswordCorrect) throw new Error("Wrong credentials!");

    return user;
  } catch (err) {
    console.log(err);
    throw new Error("Failed to login!");
  }
};

export const { handlers: {GET,POST}, auth, signIn, signOut } = NextAuth({
  // ...authConfig,
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        try {
          const user = await authenticateUser(credentials);
          return user;
        } catch (err) {
          return null;
        }
      },
    }),
  ],
})