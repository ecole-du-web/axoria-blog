import Image from "next/image"
import { getPost } from "@/lib/actions/dataActions"

export default async function page({params}) {
  const {slug} = params
  const post = await getPost(slug)
  console.log("POST RECU", post);
  
  
  return (
    <div className="pt-24">
      <h1 className="text-3xl mb-2">{post.title}</h1>
      <p className="mb-12">Tech news and useful knowledge.</p>
      <p className="">{post.desc}.</p>
    </div>
  )
}