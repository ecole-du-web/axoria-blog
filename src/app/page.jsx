import { getPosts } from "@/lib/serverActions/dataActions"
import BlogCard from "@/components/BlogCard"

export default async function Home() {
  const posts = await getPosts()
  console.log(posts)
  console.log(JSON.stringify(posts, null, 2))

  
  return (
    <div className="u-main-container u-padding-content-container">
      <h1 className="u-main-title">
        Stay up to date with AXORIA.
      </h1>
      <p className="u-main-subtitle">Tech news and useful knowledge</p>

      {/* Peut-être une animation sur les boutons pour montrer où on est */}
      <p className="mr-4 text-md text-zinc-900">Latest articles</p>
      <div className="grid grid-cols-3 gap-x-4 gap-y-8 mt-4 mb-12">
        {posts.map(post => (
          <BlogCard key={new Date()} post={post} />
        ))}
      </div>
    </div>
  )
}
