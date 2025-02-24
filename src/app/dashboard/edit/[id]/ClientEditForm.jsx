"use client"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { editPost } from "@/lib/serverActions/blog/postServerActions"

export default function Page({ post }) {
  const [tags, setTags] = useState(post.tags.map(tag => tag.name))
  
  const router = useRouter()

  const tagInputRef = useRef(null) // Utilisation d'une ref
  const submitButtonRef = useRef(null) // Utilisation d'une ref
  const imgUploadValidationText = useRef(null) // Utilisation d'une ref
  const globalValidationRef = useRef(null) // On l'appelle global et pas server ici car on l'utilise en front et en back.

  function handleAddTag(e) {
    e.preventDefault() // car c'est un bouton dans un formulaire, donc on ne veut pas le submit
    const newTag = tagInputRef.current.value.trim().toLowerCase()

    if (newTag !== "" && !tags.includes(newTag) && tags.length <= 4) {
      setTags([...tags, newTag])
      tagInputRef.current.value = "" // Réinitialisation de l'input
    }
  }

  function handleRemoveTag(tagToRemove) {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const formData = new FormData(e.target)

    // Simple validation pour savoir si on a modifié du contenu ou pas, ux non sécurisé donc à faire côté bakc end aussi
    const readableFormData = Object.fromEntries(formData)
    const areSameTags = areTagsSimilar(tags, post.tags)
    
    if(readableFormData.title === post.title && readableFormData.markdownArticle === post.markdownArticle && areSameTags) {
      globalValidationRef.current.textContent = "You must make a change before submitting."
      return 
    } else {
      globalValidationRef.current.textContent = ""
    }


    formData.set("tags", JSON.stringify(tags)) // Ajoute les potentiels nouveau tag tags au formData
    formData.set("slug", post.slug) // pour retrouver l'article


    submitButtonRef.current.textContent = "Updating Post..."
    submitButtonRef.current.disabled = true

    try {
      const result = await editPost(formData) // Appelle la fonction `editPost` avec les données du formulaire

      if (result.success) {
        submitButtonRef.current.textContent = "Post updated ✅"
        // Optionnel : redirection ou affichage de succès ici
        let countdown = 3 // Le nombre de secondes avant redirection
        globalValidationRef.current.textContent = `Redirecting in ${countdown}...`
        const interval = setInterval(() => {
          countdown -= 1
          globalValidationRef.current.textContent = `Redirecting in ${countdown}...`

          if (countdown === 0) {
            clearInterval(interval) // Arrête l'intervalle
            router.push(`/article/${result.slug}`) // Redirige
          }
        }, 1000) // Met à jour toutes les secondes (1000 ms)
      }
    } catch (error) {
      submitButtonRef.current.textContent = "Submit"
      submitButtonRef.current.disabled = false
      globalValidationRef.current.textContent = `${error.message}`
    }
  }

  function areTagsSimilar(arr1, arr2) {
    // Attention il faut passer le state en premier arg, puis le tableau de tags qui sont des objets en second
    if (arr1.length !== arr2.length) return false; // Différente taille, forcément faux
  
    return arr1.every((str, i) => str === arr2[i].name);
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    const fileType = file.type
    const validImageTypes = ["image/jpeg", "image/png", "image/webp"]

    // Vérifie si le fichier est de type image
    if (!validImageTypes.includes(fileType)) {
      imgUploadValidationText.current.textContent =
        "Please upload a valid image (JPEG, PNG, or WebP)."
      e.target.value = "" // Réinitialise l'input de fichier
      return
    } else {
      imgUploadValidationText.current.textContent = ""
    }

    const img = new Image()
    img.addEventListener("load", checkImgSizeOnLoad)

    function checkImgSizeOnLoad() {
      if (img.width > 1280 || img.height > 720) {
        imgUploadValidationText.current.textContent =
          "Image exceeds 1280x720 dimensions."
        e.target.value = "" // Réinitialise l'input de fichier
        URL.revokeObjectURL(img.src) // sinon le browser le garde en mémoire
        return
      } else {
        imgUploadValidationText.current.textContent = ""
        URL.revokeObjectURL(img.src) // sinon le browser le garde en mémoire
      }
    }

    img.src = URL.createObjectURL(file) // déclenche le chargement et donc l'écouteur de load
  }

  return (
    <main className="u-main-container  bg-white p-7 mt-12 mb-44">
      <h1 className="text-4xl mb-4">Edit that article ✍</h1>

      <form onSubmit={handleSubmit} className="pb-6">
        <label className="f-label" htmlFor="title">
          Title
        </label>
        <input
          name="title"
          className="shadow border rounded w-full p-3 mb-7 text-gray-700  focus:outline-slate-400"
          id="title"
          type="text"
          placeholder="Title"
          required
          defaultValue={post.title}
        />

        <label className="f-label" htmlFor="coverImage">
          Cover image (1280x720 for best quality, or less)
        </label>
        <input
          name="coverImage"
          className="shadow cursor-pointer border rounded w-full py-3 px-3 text-gray-700 leading-tight mb-2 focus:outline-none focus:shadow-outline"
          id="coverImage"
          type="file"
          placeholder="Bannière de votre article"
          onChange={handleFileChange} // Gestion de l'upload et du redimensionnement
        />
        <p ref={imgUploadValidationText} className="text-red-700 mb-7"></p>

        <div className="mb-10">
          <label className="f-label" htmlFor="tag">
            Add a tag(s) (optional, max 5)
          </label>
          <div className="flex">
            <input
              className="shadow border rounded  p-3 text-gray-700 focus:outline-slate-400"
              id="tag"
              type="text"
              placeholder="Add a tag"
              ref={tagInputRef}
            />
            <button
              className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold p-4 rounded ml-4 mr-4 border-none"
              onClick={handleAddTag}
              type="button"
            >
              Add
            </button>
            <div className="flex items-center grow whitespace-nowrap overflow-y-auto  shadow  border rounded px-3">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-block whitespace-nowrap bg-gray-200 text-gray-700 rounded-full px-3 py-1 text-sm font-semibold mr-2"
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

        <label className="f-label" htmlFor="markdownArticle">
          Write your article using markdown - do not repeat the already given
          title
        </label>
        <a
          target="_blank"
          href="https://www.markdownguide.org/cheat-sheet/"
          className="block mb-4 text-blue-600"
        >
          How to use markdown syntax ?
        </a>
        <textarea
          name="markdownArticle"
          id="markdownArticle"
          required
          className="min-h-44 text-xl shadow appearance-none border rounded w-full p-8  text-gray-700 mb-4 focus:outline-slate-400 "
          defaultValue={post.markdownArticle}
        ></textarea>

        <button
          ref={submitButtonRef}
          className="min-w-44  bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded border-none mb-4"
        >
          Submit
        </button>
        <p ref={globalValidationRef} className="text-xl"></p>
      </form>
    </main>
  )
}
