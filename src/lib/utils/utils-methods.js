export function normalizeUsername(userName) {
  return userName
    .trim()
    .toLowerCase() // Tout en minuscule
    .replace(/\s+/g, "-") // Remplace les espaces par des tirets
    .replace(/[^\w-]+/g, "") // Supprime les caractères spéciaux (autres que lettres, chiffres et tirets)
}