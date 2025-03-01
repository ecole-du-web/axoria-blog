import { NextResponse } from "next/server";

export async function middleware(req) {
  const authCheckUrl = new URL("/api/auth/validateSession", req.url); // prod ?
  // const authCheckUrl = "http://localhost:3000/api/auth/validateSession";

  // 🔍 Appel de notre API route d'authentification
  const authResponse = await fetch(authCheckUrl, {
    headers: {
      cookie: req.headers.get("cookie") || "", // Transmet les cookies
    },
  });

  const { authorized } = await authResponse.json();

  // ❌ Si l'utilisateur n'est pas authentifié, on le redirige vers /login
  if (!authorized) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  // ✅ Si l'utilisateur est authentifié, on laisse passer
  return NextResponse.next();
}

// Appliquer uniquement sur /dashboard et ses sous-routes
export const config = {
  matcher: ["/dashboard/:path*"],
};
