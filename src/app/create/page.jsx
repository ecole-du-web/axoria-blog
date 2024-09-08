"use client"
import { useState, useRef } from "react"
import { addPost } from "@/lib/actions/actions"

export default function page() {
  const [tags, setTags] = useState([])
  const tagInputRef = useRef(null) // Utilisation d'une ref

  function handleAddTag(e) {
    e.preventDefault()
    const newTag = tagInputRef.current.value.trim().toLowerCase()
    if (newTag !== "" && !tags.includes(newTag)) {
      setTags([...tags, newTag])
      tagInputRef.current.value = "" // Réinitialisation de l'input
    }
  }

  function handleRemoveTag(tagToRemove) {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    formData.set("tags", JSON.stringify(tags)) // Ajoute les tags au formData
    console.log(formData);
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
    addPost(formData) // Appelle la fonction `addPost` avec les données du formulaire
  }

  return (
    <div className="bg-white p-7">
      <div className="flex mb-8">
        <h1 className="text-4xl">Create an article</h1>
        <button className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded ml-auto mr-4">
          Edit
        </button>
        <button className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded">
          Preview
        </button>
      </div>

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
        required
          name="title"
          className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight mb-5 focus:outline-none focus:shadow-outline"
          id="title"
          type="text"
          placeholder="Title"
        />
        {/* <label
          className="block text-gray-700 text-md font-semibold mb-2"
          htmlFor="title"
        >
          Cover image
        </label>
        <input
          className="shadow cursor-pointer border rounded w-full py-3 px-3 bg-white text-gray-700 leading-tight mb-5 focus:outline-none focus:shadow-outline"
          id="title"
          type="file"
          placeholder="Title"
        /> */}

        <div className="mb-7">
          <label
            className="block text-gray-700 text-md font-semibold mb-2"
            htmlFor="tag"
          >
            Add a tag(s)
          </label>
          <div className="flex">
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
                  className="inline-block bg-gray-200 text-gray-700 rounded-full px-3 py-1 text-sm font-semibold mr-2 mb-2"
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
          Write your article
        </label>

        <textarea
        required
          name="desc"
          id="content"
          className="min-h-44 shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight mb-5 focus:outline-none focus:shadow-outline"
        ></textarea>

        <button className="min-w-44 self-end bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded border-none ">
          Submit
        </button>
      </form>
    </div>
  )
}
