
import BlogCard from "@/components/BlogCard"
import { getPosts } from "@/lib/server/blog/postMethods"

export const revalidate = 60;

export default async function Home() {
  console.log("Rendering Home page...");
  const posts = await getPosts()
  console.log(posts);
  
  return (
    <div className="u-main-container u-padding-content-container">
      <h1 className="t-main-title">Stay up to date with AXORIA.</h1>
      <p className="t-main-subtitle">Tech news and useful knowledge</p>

      {/* Peut-être une animation sur les boutons pour montrer où on est */}
      <p className="mr-4 text-md text-zinc-900">Latest articles</p>
      <ul className="u-articles-grid">
        {posts.length > 0 ? (
          posts.map((post,id) => <BlogCard key={id} post={post} />)
        ) : (
          <li>No articles found. 🤖</li>
        )}
      </ul>
    </div>
  )
}
