export default function page() {
  return (
    <form className="max-w-md mx-auto">
      <label
        class="block text-gray-700 text-md font-semibold mb-2"
        for="emailOrPseudo"
      >
        E-mail or pseudo
      </label>
      <input
        class="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight mb-5 focus:outline-none focus:shadow-outline"
        id="emailOrPseudo"
        type="text"
        placeholder="Name or pseudo"
      />

      

      <label
        class="block text-gray-700 text-md font-semibold mb-2"
        for="password"
      >
        Password
      </label>
      <input
        class="mb-10 shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        id="password"
        type="password"
        placeholder="Your password"
      />

     

      <button className="w-full self-end bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded border-none ">
        Submit
      </button>
    </form>
  )
}
