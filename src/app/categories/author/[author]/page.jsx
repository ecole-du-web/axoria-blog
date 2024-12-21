import { getArticlesByAuthor } from "@/lib/serverActions/blog/dataFetchers"
import BlogCard from "@/components/BlogCard"
import CardList from "@/components/CardList"
import { notFound } from "next/navigation"; // Méthode native pour rendre une 404

export default async function page({ params }) {
  const { author } = params
  const posts = await getArticlesByAuthor(author)
  console.log(posts, params)

  if (!posts.author) {
    notFound(); // page 404 si l'auteur n'existe pas
  }
  return (
    <main className="u-main-container u-padding-content-container">
      <h1 className="u-main-title">Posts from {posts.author.userName}.</h1>
      <p className="u-main-subtitle">All of that author's posts</p>

      {/* Peut-être une animation sur les boutons pour montrer où on est */}
      {/* new date ? juste l'id de map si c'est pas une liset dynamique */}
      <p className="mr-4 text-md text-zinc-900">Latest articles</p>
      <CardList>
        {posts.articles.map(post => (
          <BlogCard key={new Date()} post={post} />
        ))}
      </CardList>
    </main>
  )
}
