// middleware.js
import { withAuth } from "next-auth/middleware";

// Export the middleware function directly
export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: ["/dashboard", "/", "/profile"],
};