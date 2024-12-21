/* 
1. Au début utilise des données locales avec tableau et tout ce qu'il faut, auteur, titre, etc
2. Déplace getPosts en SA, ou commence directement les SA avec Mongo
*/
import BlogCard from "@/components/BlogCard"
import { getPosts } from "@/lib/serverActions/blog/posts"
export default async function Home() {
  const posts = await getPosts()
  
  return (
    <div className="u-main-container u-padding-content-container">
      <h1 className="u-main-title">
        Stay up to date with AXORIA.
      </h1>
      <p className="u-main-subtitle">Tech news and useful knowledge</p>

      {/* Peut-être une animation sur les boutons pour montrer où on est */}
      <p className="mr-4 text-md text-zinc-900">Latest articles</p>
      <div className="u-articles-grid">
        {posts.map(post => (
          <BlogCard key={new Date()} post={post} />
        ))}
      </div>
    </div>
  )
}
