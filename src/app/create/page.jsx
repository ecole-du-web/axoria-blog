import { addPost } from "@/lib/actions/actions"

export default function page() {
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
      <form action={addPost} >
        <label
          class="block text-gray-700 text-md font-semibold mb-2"
          htmlFor="title"
        >
          Title
        </label>
        <input
          name="title"
          class="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight mb-5 focus:outline-none focus:shadow-outline"
          id="title"
          type="text"
          placeholder="Title"
        />
        {/* <label
          class="block text-gray-700 text-md font-semibold mb-2"
          htmlFor="title"
        >
          Cover image
        </label>
        <input
          class="shadow cursor-pointer border rounded w-full py-3 px-3 bg-white text-gray-700 leading-tight mb-5 focus:outline-none focus:shadow-outline"
          id="title"
          type="file"
          placeholder="Title"
        /> */}

        {/* <div className="flex mb-7">
          <div>
            <label
              class="block text-gray-700 text-md font-semibold mb-2"
              htmlFor="tag"
            >
              Add a tag(s)
            </label>
            <input
              class="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight  focus:outline-none focus:shadow-outline"
              id="tag"
              type="text"
              placeholder="Add a tag"
            />
            <input
              class="hidden"
              name="tags"
              type="text"
            />
          </div>
          <button className="self-end bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded ml-4 mr-4 border-none ">
          Add
        </button>
        <div class="self-end bg-white shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight  focus:outline-none focus:shadow-outline">Your tags ...</div>
        </div> */}

        <label
          class="block text-gray-700 text-md font-semibold mb-2"
          htmlFor="content"
        >
          Write your article
        </label>

        <textarea
          name="desc"
          id="content"
          class="min-h-44 shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight mb-5 focus:outline-none focus:shadow-outline"
        ></textarea>

        <button className="min-w-44 self-end bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded border-none ">
          Submit
        </button>
      </form>
    </div>
  )
}
