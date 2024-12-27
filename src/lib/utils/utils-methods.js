export function normalizeText(userName) {
  return userName
    .trim()
    .toLowerCase() // Tout en minuscule
    .normalize("NFD") // Décompose les caractères accentués en caractère + son code unicode, visible seulement avec for of
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
    .replace(/\s+/g, "-") // Remplace les espaces par des tirets
    .replace(/[^\w-]+/g, ""); // Supprime les caractères spéciaux (autres que lettres, chiffres et tirets)
}