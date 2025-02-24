import Link from "next/link"
import { getTags } from "@/lib/server/blog/tagMethods"

export default async function Page() {
  const tags = await getTags() // Récupération des tags
  console.log(tags, "tagsConsole");
  
  return (
    <div className="u-main-container u-padding-content-container">
      <h1 className="t-main-title">All categories</h1>
      <p className="t-main-subtitle">Find articles sorted by category tag.</p>

      {/* Section pour afficher les tags */}
      <div className="u-articles-grid">
        {tags.length > 0 ? (
          tags.map(tag => (
            <div
              key={tag._id}
              className="p-4 pb-6 bg-gray-100 border rounded shadow-md"
            >
              <Link
                href={`/categories/tag/${tag.slug}`}
                className="block mb-2 text-lg font-semibold underline"
              >
                #{tag.name}
              </Link>
              <p>Nombre d'articles : {tag.postCount}</p>{" "}
            </div>
          ))
        ) : (
          <p>No categories found.</p>
        )}
      </div>
    </div>
  )
}
