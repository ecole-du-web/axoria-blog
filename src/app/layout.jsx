import "./globals.css"
import Navbar from "@/components/Navbar/Navbar"
import Footer from "@/components/Footer"



export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col">
          <Navbar />
          <div className="grow">{children}</div>
          <Footer />
      </body>
    </html>
  )
}
