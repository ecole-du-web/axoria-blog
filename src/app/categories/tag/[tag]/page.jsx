import BlogCard from "@/components/BlogCard"

import { getPostsByTag } from "@/lib/server/blog/postMethods"
export default async function page({ params }) {
  const { tag } = params
  const posts = await getPostsByTag(tag)
  console.log(posts, "yyy");
  
  return (
    <div className="u-main-container u-padding-content-container">
      <h1 className="t-main-title">Posts from the #{tag} tag. 🏷️</h1>
      <p className="t-main-subtitle">All of the posts that uses that tag</p>

      <p className="mr-4 text-md text-zinc-900">Latest articles</p>
      {/* Parfois des tags peuvent avoir été créé mais vides car les articles associés ont été supprimés, donc on gère ce cas rare */}
    
      <ul className="u-articles-grid">
        {posts.length > 0 ? (
          posts.map((post,id) => <BlogCard key={id} post={post} />)
        ) : (
          <li>No articles found for that tag. 🤖</li>
        )}
      </ul>
    </div>
  )
}
