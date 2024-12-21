import { getArticlesByTag } from "@/lib/serverActions/blog/dataFetchers"
import BlogCard from "@/components/BlogCard"
import CardList from "@/components/CardList"
import { notFound } from "next/navigation" // Méthode native pour rendre une 404

export default async function page({ params }) {
  const { tag } = params
  const posts = await getArticlesByTag(tag)
  console.log("POSSSSSSSSSSSSSSTS", posts)
  if (posts.error) {
    notFound() // page 404 si l'auteur n'existe pas
  }
  return (
    <main className="u-main-container u-padding-content-container">
      <h1 className="u-main-title">Posts from the #{tag} tag.</h1>
      <p className="u-main-subtitle">All of the posts that uses that tag</p>

      {/* Peut-être une animation sur les boutons pour montrer où on est */}
      {/* new date ? juste l'id de map si c'est pas une liset dynamique */}
      <p className="mr-4 text-md text-zinc-900">Latest articles</p>
      <CardList>
        {posts.map(post => (
          <BlogCard key={new Date()} post={post} />
        ))}
      </CardList>
    </main>
  )
}
