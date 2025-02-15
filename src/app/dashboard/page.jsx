import Link from "next/link"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getUserPostsFromSessionID } from "@/lib/server/blog/postMethods"
import { deletePost } from "@/lib/serverActions/blog/postServerActions"
import { validateSession } from "@/lib/server/session/sessionMethods"
export default async function page() {
  // Récupérer le cookie de session
  const cookieStore = cookies()
  const sessionId = cookieStore.get("sessionId")?.value

  // Valider la session
  const userId = await validateSession(sessionId)

  if (!userId) {
    redirect("/signin") // Redirige si la session est invalide
  }

  const posts = await getUserPostsFromSessionID(userId) // Récupère les articles de l'utilisateur connecté
  // console.log(posts)

  return (
    <main className="u-main-container u-padding-content-container">
      <h1 className="text-3xl mb-5">Dashboard - Your articles</h1>
      <ul>
        {posts.length > 0 ? (
          posts.map(post => (
            <li
              className="flex items-center mb-2 bg-slate-50 py-2 pl-4"
              key={post._id}
            >
              <Link
                className="mr-auto underline underline-offset-2 text-violet-600"
                href={`article/${post.title}`}
              >
                {post.title}
              </Link>
              <form action={deletePost}>
                <input type="hidden" name="id" value={post._id.toString()} />
                <button className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded mr-2">
                  Delete
                </button>
              </form>
              <Link
                className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded mr-2"
                href={`/dashboard/edit/${post.slug}`}
              >
                Edit
              </Link>
            </li>
          ))
        ) : (
          <li>You haven't created any articles yet.</li>
        )}
      </ul>
    </main>
  )
}
