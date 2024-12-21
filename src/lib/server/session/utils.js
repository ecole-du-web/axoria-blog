export function isPrivatePage(pathname) {
  const privateSegments = ["/dashboard"]; // Registre des segments privés
  return privateSegments.some(segment => pathname.startsWith(segment));
}