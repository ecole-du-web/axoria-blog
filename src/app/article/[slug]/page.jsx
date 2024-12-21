import Image from "next/image"
import { getPost } from "@/lib/serverActions/dataActions"
import HighlightedCode from "./HighlightedCode"
import Link from "next/link"

export default async function page({ params }) {
  const { slug } = params
  const post = await getPost(slug)
  console.log("ARTICLE", post)

  return (
    <main className="u-main-container u-padding-content-container">
      <h1 className="text-4xl mb-2">{post.title}</h1>
      <p className="mb-6">
        <Link href={`/categories/author/${post.normalizedUserName}`} className="mr-4">By {post.author}</Link>
        {post.tags.map(tag => <span className="ml-2">#{tag}</span>)}
      </p>
      <Image
        src={post.coverImageUrl}
        width={1280}
        height={720}
        alt={post.title}
        className="mb-10"
      />
   
      {/* Affichage sécurisé du HTML */}
      <HighlightedCode desc={post.desc} />
    </main>
  )
}
