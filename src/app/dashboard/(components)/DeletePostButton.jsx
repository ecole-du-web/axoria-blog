"use client"
import { deletePost } from "@/lib/serverActions/blog/postServerActions"

export default function DeletePostButton({id}) {
  return (
    <button 
    onClick={() => deletePost(id)}
    className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded mr-2">
    Delete
  </button>
  )
}