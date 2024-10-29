import Image from "next/image"
import { getPost } from "@/lib/actions/dataActions"

import HighlightedCode from "./HighlightedCode"

export default async function page({ params }) {
  const { slug } = params
  const post = await getPost(slug)
  console.log("ARTICLE", post)

  return (
    <div className="pt-24">
      <img src={post.coverImageUrl} alt={post.title} />
      <h1 className="text-3xl mb-2">{post.title}</h1>
      <h1>
        {post.tags.map(tag => (
          <p>{tag.name}</p>
        ))}
      </h1>
      {/* Affichage sécurisé du HTML */}
      <HighlightedCode desc={post.desc} />
    </div>
  )
}
