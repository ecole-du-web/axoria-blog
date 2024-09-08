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
      <h1 className="text-3xl mb-2">All categories</h1>
      <p className="mb-12">Find articles sorted by category tag.</p>

      {/* Peut-être une animation sur les boutons pour montrer où on est */}
      <button className="mr-4 text-xl">Latest</button>
      <button className="text-xl">Most Liked</button>
      <div className="grid grid-cols-3 gap-4 mt-4 mb-12">
        {posts.map((post) => (
          <div>
            <p>JavaScript</p>
            <p>Nombre d'articles : 99</p>
          </div>
        ))}
      </div>
      {posts.length > 9 && <button className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded w-fit block mx-auto">Load more</button>}
    </>
  )
}