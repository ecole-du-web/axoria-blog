import Image from "next/image"
import Link from "next/link"
export default function BlogCard({ post }) {
  return (
    <li className="rounded-sm shadow-md hover:shadow-xl hover:border-zinc-300 ">
      {/* Image entourée d'un lien */}
      <Link
        href={`/article/${post.slug}`}
        // block pour faire fonctionner le padding
      >
        <Image
          src={post.coverImageUrl}
          // image depuis firebase, mets une image de public de base
          width={340}
          height={190}
          alt="Article thumbnail"
          className="w-full rounded-t-sm object-cover"
        />
      </Link>
      <div className="pt-5 px-5 pb-7">
        <div className="flex w-full items-baseline gap-x-4 text-xs">
          {/* La méthode toISOString() est utilisée pour générer une représentation standardisée de la date en format ISO8601, qui est reconnue universellement par les machines, les crawlers, et les systèmes. */}
          {/* Produit un format ISO8601 : YYYY-MM-DDTHH:mm:ss.sssZ (par exemple, 2024-12-22T10:25:53.326Z). */}
          {/* Le constructeur new date accepte le format standard retournée par mongo createdAt 2024-12-22T10:31:55.151+00:00 */}
          <time
            dateTime={new Date(post.createdAt).toISOString()}
            className="text-gray-500 text-sm"
          >
            {new Date(post.createdAt).toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <Link
            href={`/categories/author/${post.author.normalizedUserName}`}
            className="ml-auto text-base text-gray-700 hover:text-gray-600 whitespace-nowrap truncate"
          >
            {post.author.userName}
          </Link>
        </div>
        <Link
          href={`/article/${post.slug}`}
          // inline-block pour le mt sans prendre toute la ligne
          className="inline-block mt-6 text-xl font-semibold text-zinc-800 hover:text-zinc-600"
        >
          {post.title}
        </Link>
      </div>
    </li>
  )
}
