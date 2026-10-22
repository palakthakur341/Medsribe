import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => {
      // If middleware runs, auth is required
      return !!token;
    },
  },
});

export const config = {
  matcher: [
    // Run auth middleware ONLY on protected app routes
    "/doctor/:path*",
    "/patient/:path*",
    "/pharmacy/:path*",
  ],
};
