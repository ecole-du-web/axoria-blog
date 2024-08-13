import Link from "next/link"

export default function Navbar() {
  return (
    <nav className="w-full bg-slate-50 ">
      <div className="max-w-6xl mx-auto flex py-4 px-12 ">
        <Link class="mx-2" href="/">
          AXORIA
        </Link>
        <Link class="mx-2 mr-auto" href="/articles">
          Categories
        </Link>

        <Link class="mx-2" href="/signin">
          Sign In
        </Link>
        <Link class="mx-2" href="/signup">
          Sign Up
        </Link>
      </div>
    </nav>
  )
}
