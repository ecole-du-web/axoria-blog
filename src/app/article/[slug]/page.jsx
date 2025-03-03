import Image from "next/image"
import Link from "next/link"
import { getPost } from "@/lib/server/blog/postMethods"
import 'prism-themes/themes/prism-vsc-dark-plus.css';
import "./article-styles.css"
// export async function generateStaticParams() {
//   await connectToDB();
//   const posts = await Post.find({}, "slug")

//   return posts.map(post => ({ slug: post.slug }));
// }
export default async function page({ params }) {
  const { slug } = await params
  const post = await getPost(slug)
  
  return (
    <main className="u-main-container u-padding-content-container">
      <h1 className="text-4xl mb-3">{post.title}</h1>
      <p className="mb-6">
        By&nbsp;
        <Link
          href={`/categories/author/${post.author.normalizedUserName}`}
          className="mr-4 underline"
        >
          {post.author.userName}
        </Link>
        {post.tags.map(tag => (
          <Link
            key={tag.slug}
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
      <div
        className="article-styles"
        dangerouslySetInnerHTML={{ __html: post.markdownHTMLResult }}
        suppressHydrationWarning={true}
      ></div>
    </main>
  )
}
