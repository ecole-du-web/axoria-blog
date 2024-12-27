import Image from "next/image"
import HighlightedCode from "./HighlightedCode"
import Link from "next/link"
import { getPost } from "@/lib/server/blog/postMethods"
export default async function page({ params }) {
  const { slug } = params
  const post = await getPost(slug)

  return (
    <main className="u-main-container u-padding-content-container">
      <h1 className="text-4xl mb-3">{post.title}</h1>
      <p className="mb-6">
        By&nbsp;
        <Link
          href={`/categories/author/${post.normalizedUserName}`}
          className="mr-4 underline"
        >
          {post.author}
        </Link>
        {post.tags.map(tag => (
          <Link
            key={tag}
            href={`/categories/tag/${tag.slug}`}
            className="mr-4 underline"
          >
            <span>#{tag.name}</span>
          </Link>
        ))}
      </p>
      <Image
        src={post.coverImageUrl}
        width={1280}
        height={720}
        alt={post.title}
        className="mb-10"
      />

      {/* Affichage sécurisé du HTML */}
      <HighlightedCode markdownHTMLResult={post.markdownHTMLResult} />
    </main>
  )
}
