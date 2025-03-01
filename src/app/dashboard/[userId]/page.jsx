import Link from "next/link"
import { redirect } from "next/navigation"
import { getUserPostsFromSessionID } from "@/lib/server/blog/postMethods"
import DeletePostButton from "./(components)/DeletePostButton"
import { sessionInfo } from "@/lib/server/session/sessionMethods"

export default async function page({ params }) {
  const { userId } = await params

  const posts = await getUserPostsFromSessionID(userId) // Récupère les articles de l'utilisateur connecté
  

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
                href={`/article/${post.slug}`}
              >
                {post.title}
              </Link>
              <DeletePostButton id={post._id.toString()}/>
              {/* <form action={deletePost}>
                <input type="hidden" name="id" value={post._id.toString()} />
                <button className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded mr-2">
                  Delete
                </button>
              </form> */}
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
