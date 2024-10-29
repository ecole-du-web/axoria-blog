
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="flex h-full flex-col">
        <Navbar />
        <main className="grow w-full max-w-6xl m-auto pt-20 px-12 pb-44">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
