import BlogCard from "@/components/BlogCard"
import { notFound } from "next/navigation" // Méthode native pour rendre une 404
import { getPostsByAuthor } from "@/lib/server/blog/postMethods"

export default async function page({ params }) {
  const { author } = await params
  const postsFromAuthor = await getPostsByAuthor(author)
  console.log(postsFromAuthor);
  
  return (
    <div className="u-main-container u-padding-content-container">
      <h1 className="t-main-title">
        Posts from {postsFromAuthor.author.userName}. 📚
      </h1>
      <p className="t-main-subtitle">Every posts from that author</p>

      {/* Peut-être une animation sur les boutons pour montrer où on est */}
      {/* new date ? juste l'id de map si c'est pas une liset dynamique */}
      <p className="mr-4 text-md text-zinc-900">Latest articles</p>
      <div className="u-articles-grid">
        {postsFromAuthor.posts.length > 0 ? (
          postsFromAuthor.posts.map((post, id) => (
            <BlogCard key={id} post={post} />
          ))
        ) : (
          <li>There is no articles written by that author. 🤖</li>
        )}
      </div>
    </div>
  )
}
