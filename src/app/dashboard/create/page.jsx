"use client"
import { useState, useRef } from "react"
import { addPost } from "@/lib/serverActions/blog/CDUactions"
import { useRouter } from "next/navigation"

export default function Page() {

  const [tags, setTags] = useState([])
  const router = useRouter()

  const tagInputRef = useRef(null) // Utilisation d'une ref
  const submitButtonRef = useRef(null)
  const serverValidationText = useRef(null)

  function handleAddTag(e) {
    e.preventDefault()
    const newTag = tagInputRef.current.value.trim().toLowerCase()
    if (newTag !== "" && !tags.includes(newTag)) {
      setTags([...tags, newTag])
      tagInputRef.current.value = "" // Réinitialisation de l'input
    }
  }
  // console.log(validation)

  function handleRemoveTag(tagToRemove) {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const formData = new FormData(e.target)

    formData.set("tags", JSON.stringify(tags)) // Ajoute les tags au formData

    console.log(formData)
    for (let [key, value] of formData.entries()) {
      console.log(key, value)
    }

    submitButtonRef.current.textContent = "Saving Post..."
    const result = await addPost(formData)

    if (result.success) {
      submitButtonRef.current.textContent = "Post Saved ✅"
      // Optionnel : redirection ou affichage de succès ici
      let countdown = 3 // Le nombre de secondes avant redirection
      serverValidationText.current.textContent = `Redirecting in ${countdown}...`
      const interval = setInterval(() => {
        countdown -= 1
        serverValidationText.current.textContent = `Redirecting in ${countdown}...`

        if (countdown === 0) {
          clearInterval(interval) // Arrête l'intervalle
          router.push(`/article/${result.slug}`) // Redirige
        }
      }, 1000) // Met à jour toutes les secondes (1000 ms)
    } else {
      submitButtonRef.current.textContent = "Submit"
      serverValidationText.current.textContent = `Error while uploading the post. Please try again or contact the site team.`
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    const fileType = file.type
    const validImageTypes = ["image/jpeg", "image/png", "image/webp"]

    // Vérifie si le fichier est de type image
    if (!validImageTypes.includes(fileType)) {
      alert("Please upload a valid image (JPEG, PNG, or WebP).")
      e.target.value = "" // Réinitialise l'input de fichier
      return
    }

    // Vérifie si la taille du fichier dépasse 4 Mo
    const maxSize = 4 * 1024 * 1024 // 4 Mo en octets
    if (file.size > maxSize) {
      alert("File size exceeds 4MB, please upload a smaller file.")
      e.target.value = "" // Réinitialise l'input de fichier
      return
    }
  }

  return (
    <main className="u-main-container bg-white p-7 mt-12 mb-44">
      {/* 
      si on veut juste envoyer un simple post sans tags
      <form action={addPost} > */}
      <form onSubmit={handleSubmit}>
        <label
          className="block text-gray-700 text-md font-semibold mb-2"
          htmlFor="title"
        >
          Title
        </label>
        <input
          name="title"
          className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight mb-7 focus:outline-none focus:shadow-outline"
          id="title"
          type="text"
          placeholder="Title"
          required
        />
   
        <label
          className="block text-gray-700 text-md font-semibold mb-2"
          htmlFor="coverImage"
        >
          Cover image (1280x720 for best quality, or less)
        </label>
        <input
          name="coverImage"
          className="shadow cursor-pointer border rounded w-full py-3 px-3 bg-white text-gray-700 leading-tight mb-7 focus:outline-none focus:shadow-outline"
          id="coverImage"
          type="file"
          required

          placeholder="Bannière de votre article"
          onChange={handleFileChange} // Gestion de l'upload et du redimensionnement
        />
 

        <div className="mb-10">
          <label
            className="block text-gray-700 text-md font-semibold mb-2"
            htmlFor="tag"
          >
            Add a tag(s) (optional, max 5)
          </label>
          <div className="flex ">
            <input
              className="shadow appearance-none border rounded  py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="tag"
              type="text"
              placeholder="Add a tag"
              ref={tagInputRef}
            />
            <button
              className=" bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded ml-4 mr-4 border-none"
              onClick={handleAddTag}
            >
              Add
            </button>
            <div className="grow bg-white shadow appearance-none border rounded  py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block bg-gray-200 text-gray-700 rounded-full px-3 py-1 text-sm font-semibold mr-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-red-500"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <label
          className="block text-gray-700 text-md font-semibold mb-2"
          htmlFor="content"
        >
          Write your article using markdown - do not repeat the already given title
        </label>
        <a target="_blank" href="https://www.markdownguide.org/cheat-sheet/" className="block mb-4 text-blue-600">How to use markdown syntax ?</a>

        <textarea
          name="desc"
          id="content"
          required
          className="min-h-44 shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight mb-2 focus:outline-none focus:shadow-outline"
        ></textarea>
       
        <button
          ref={submitButtonRef}
          className="min-w-44 self-end bg-indigo-500 hover:bg-indigo-700 text-white font-bold mb-4 py-3 px-4 rounded border-none "
        >
          Submit
        </button>
        <p ref={serverValidationText} className="text-xl"></p>
      </form>
    </main>
  )
}
