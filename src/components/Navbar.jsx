import Link from "next/link"

export default function Navbar() {
  return (
    <nav className="w-full bg-slate-50 ">
      <div className="max-w-6xl mx-auto flex py-4 px-12 ">
        <Link className="mx-2" href="/">
          AXORIA
        </Link>
        <Link className="mx-2 mr-auto" href="/categories">
          Categories
        </Link>

        <Link className="mx-2" href="/signin">
          Sign In
        </Link>
        <Link className="mx-2" href="/signup">
          Sign Up
        </Link>
      </div>
    </nav>
  )
}
