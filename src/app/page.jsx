import Image from "next/image";
import Link from "next/link";
import { getPosts } from "@/lib/actions/dataActions";



export default async function Home() {
  const posts = await getPosts()
  return (
    <div className="mt-24">
      <h1 className="text-3xl mb-2">Stay up to date with AXORIA.</h1>
      <p className="mb-12">Tech news and useful knowledge</p>

      {/* Peut-être une animation sur les boutons pour montrer où on est */}
      <p className="mr-4 text-xl">Latest articles</p>
      <div className="grid grid-cols-2 gap-4 mt-4 mb-12">
        {posts.map((post) => (
          <div>
            <Link href="/articles/test">
            <div className="relative">
            </div>
            <p>{post.title}</p>
            <p>{post.desc}</p>
            </Link>
          </div>
        ))}
      </div>
      {posts.length > 9 && <button className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded w-fit block mx-auto">Load more</button>}
    </div>
  );
}
