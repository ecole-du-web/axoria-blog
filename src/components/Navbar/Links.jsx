import Link from "next/link"
import Dropdown from "./Dropdown/Dropdown"

export default function Links({session}) {
  return (
    <div className="max-w-6xl mx-auto flex py-4 px-12 ">
    <Link className="mx-2 text-zinc-900" href="/">
      AXORIA
    </Link>
    <Link className="mx-2 mr-auto text-zinc-900" href="/categories">
      Categories
    </Link>
    {session && (
      <Link className="mr-4 text-zinc-900" href="/create">
        Add an article
      </Link>
    )}
    <div>
      {session ? (
        <Dropdown />
      ) : (
        <>
          <Link className="mx-2 text-zinc-900" href="/signin">
            Sign In
          </Link>
          <Link className="mx-2 text-zinc-900" href="/signup">
            Sign Up
          </Link>
        </>
      )}
    </div>
  </div>
  )
}