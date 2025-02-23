import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "../../../../lib/prisma"; // Correct relative import path
import NextAuth from "next-auth";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials?.email },
        });

        // If no user or password doesn't match, return null
        if (!user || !bcrypt.compareSync(credentials?.password || "", user.password)) {
          return null;
        }

        return user; // Return the user if authenticated
      },
    }),
  ],
  pages: {
    signIn: "/login", // Custom login page if needed
  },
  callbacks: {
    async jwt({ token, user }) {
      // On sign in, add user info to the JWT token
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user info to the session
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // Make sure this is set in your .env file
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
