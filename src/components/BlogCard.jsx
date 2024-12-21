import Image from "next/image"
import Link from "next/link"
import { normalizeUsername } from "@/lib/utils/utils-methods"
export default function BlogCard({ post }) {
  console.log("POST RECUP",post)
console.log(normalizeUsername(post.author.userName));

  return (
    <div className=" hover:border-zinc-300 rounded-sm shadow-md hover:shadow-xl">
      <Link
        href={`/article/${post.slug}`}
        // block pour faire fonctionner le padding
        className="block"
      >
        <Image
          src={post.thumbnailUrl}
          width={320}
          height={180}
          alt="Article thumbnail"
          className="w-full rounded-t-sm "
        />
      </Link>
      <div className="p-3 pb-5">
        <article className="flex max-w-xl flex-col items-start justify-between">
          <div className="flex w-full items-baseline gap-x-4 text-xs">
            <time dateTime="2020-03-16" className="text-gray-500 text-sm">
              {new Date(post.createdAt).toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <Link href={`/categories/author/${post.author.normalizedUserName}`} className="ml-auto text-base text-gray-700">{post.author.userName}</Link>
          </div>
          <div className="group relative">
            <Link
              href={`/article/${post.slug}`}
              // block pour faire fonctionner le padding
              className="block mt-6 text-xl font-semibold text-zinc-800 group-hover:text-gray-600"
            >
              {post.title}
            </Link>
          </div>
        </article>
      </div>
    </div>
  )
}
