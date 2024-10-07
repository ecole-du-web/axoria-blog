// lib/auth.config.js

export const authConfig = {
  pages: {
    signIn: "/login",  // Redirige vers la page de connexion si non authentifié
  },
  callbacks: {
    // Gestion des tokens JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    // Gestion des sessions utilisateur
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.isAdmin = token.isAdmin || false;  // Ajoute le rôle admin
      }
      return session;
    },
    // Gestion des autorisations pour les routes privées
    authorized({ auth, request }) {
      const user = auth?.user;
      const isOnAdminPanel = request.nextUrl?.pathname.startsWith("/admin");
      const isOnBlogPage = request.nextUrl?.pathname.startsWith("/blog");
      const isOnLoginPage = request.nextUrl?.pathname.startsWith("/login");

      // Seuls les admins peuvent accéder au tableau de bord admin
      if (isOnAdminPanel && !user?.isAdmin) {
        return false;
      }

      // Seuls les utilisateurs authentifiés peuvent accéder aux pages du blog
      if (isOnBlogPage && !user) {
        return false;
      }

      // Rediriger les utilisateurs authentifiés loin de la page de connexion
      if (isOnLoginPage && user) {
        return Response.redirect(new URL("/", request.nextUrl));
      }

      return true;
    },
  },
};
