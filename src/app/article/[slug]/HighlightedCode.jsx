"use client"
import "./article-styles.css"
import { useEffect } from "react"
import Prism from "prismjs"
import 'prism-themes/themes/prism-vsc-dark-plus.css';

// Laid
// import "prismjs/themes/prism-twilight.css" // Importer le thème
import "prismjs/components/prism-javascript" // Exemple pour le JS
import "prismjs/components/prism-css" // Exemple pour le CSS
export default function HighlightedCode({ markdownHTMLResult }) {
  useEffect(() => {
    // Active la coloration syntaxique avec Prism.js après le rendu du composant
    Prism.highlightAll()
  }, [])
  return (
    <div className="article-styles" dangerouslySetInnerHTML={{ __html: markdownHTMLResult }}></div>
  )
}
