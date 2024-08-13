import Image from "next/image";

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

export default function Home() {

  return (
    <>
      <h1 className="text-3xl mb-2">Stay up to date with AXORIA.</h1>
      <p className="mb-12">Tech news and useful knowledge</p>

      {/* Peut-être une animation sur les boutons pour montrer où on est */}
      <button className="mr-4 text-xl">Latest</button>
      <button className="text-xl">Most Liked</button>
      <div className="grid grid-cols-3 gap-4 mt-4 mb-12">
        {posts.map((post) => (
          <div>
            <div className="relative">
              <Image src={post.img} alt="cover test" width={1920} height={1080} />
              {/* Animation de coeur à rajouter ? */}
              <Image src="/heart.svg" className="absolute top-2 right-2 w-7" width={53} height={53} />
            </div>
            <p>{post.title}</p>
            <p>{post.author}</p>
          </div>
        ))}
      </div>
      {posts.length > 9 && <button className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded w-fit block mx-auto">Load more</button>}
    </>
  );
}
