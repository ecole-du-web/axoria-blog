import Image from "next/image"
import { getTags } from "@/lib/serverActions/dataActions"
import Link from "next/link"
import CardList from "@/components/CardList"

export default async function Page() {
  const tags = await getTags() // Récupération des tags
  console.log(tags)

  return (
    <div className="u-main-container u-padding-content-container">
      <h1 className="u-main-title">All categories</h1>
      <p className="u-main-subtitle">Find articles sorted by category tag.</p>

      {/* Section pour afficher les tags */}
      <CardList>
        {tags.length > 0 ? (
          tags.map(tag => (
            <div
              key={tag._id}
              className="p-4 pb-6 bg-gray-100 border rounded shadow-md"
            >
              <Link
                href={`/categories/tag/${tag.name}`}
                className="block mb-2 text-lg font-semibold underline"
              >
                #{tag.name}
              </Link>
              <p>Nombre d'articles : {tag.postCount}</p>{" "}
              {/* Nombre d'articles */}
            </div>
          ))
        ) : (
          <p>No tag found.</p>
        )}
      </CardList>
    </div>
  )
}
