import Image from "next/image"
const posts = [
  {
    img: "/cover-test.jpg",
    title: "5 JavaScript tips",
    author: "John doe"
  },
  {
    img: "/cover-test.jpg",
    title: "5 JavaScript tips",
    author: "John doe"
  },
  {
    img: "/cover-test.jpg",
    title: "5 JavaScript tips",
    author: "John doe"
  },
  {
    img: "/cover-test.jpg",
    title: "5 JavaScript tips",
    author: "John doe"
  },
  {
    img: "/cover-test.jpg",
    title: "5 JavaScript tips",
    author: "John doe"
  },
  {
    img: "/cover-test.jpg",
    title: "5 JavaScript tips",
    author: "John doe"
  },
  {
    img: "/cover-test.jpg",
    title: "5 JavaScript tips",
    author: "John doe"
  },
  {
    img: "/cover-test.jpg",
    title: "5 JavaScript tips",
    author: "John doe"
  },
  {
    img: "/cover-test.jpg",
    title: "5 JavaScript tips",
    author: "John doe"
  },
  {
    img: "/cover-test.jpg",
    title: "5 JavaScript tips",
    author: "John doe"
  },
]

export default function page() {
  return (
    <>
      <h1 className="text-3xl mb-2">Category : JavaScript</h1>
      <p className="mb-12">All articles related to this tag.</p>

      {/* Peut-être une animation sur les boutons pour montrer où on est */}
      <button className="mr-4 text-xl">Latest</button>
      <button className="text-xl">Most Liked</button>
      <div className="grid grid-cols-3 gap-4 mt-4 mb-12">
        {posts.map((post) => (
          <div>
            <div className="relative">
              {/* Animation de coeur à rajouter ? */}
            </div>
            <p>{post.title}</p>
            <p>{post.author}</p>
          </div>
        ))}
      </div>
      {posts.length > 9 && <button className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded w-fit block mx-auto">Load more</button>}
    </>
  )
}