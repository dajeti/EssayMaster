import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) throw new Error("No user found");

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid password");

        return { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName };
      }
      ,
    }),
  ],

  callbacks: {
    async session({ session, token }) {
      console.log("Session callback token:", token);

      if (token.sub) {
        session.user = {
          id: token.sub, // Set the ID in session.user
          email: token.email, // Set the email in session.user
          firstName: token.firstName, // Set the first name
          lastName: token.lastName, // Set the last name
        };

        // Storing session ID in localStorage only for the client-side (in the browser)
        if (typeof window !== "undefined") {
          localStorage.setItem("currentSessionId", token.sub); // Set session ID in localStorage
        }
      }
      return session;
    },

    async jwt({ token, user }) {
      console.log("JWT callback user:", user);
      if (user) {
        token.sub = user.id; // Store the user's ID in the token
        token.email = user.email; // Store the user's email
        token.firstName = user.firstName; // Store first name
        token.lastName = user.lastName; // Store last name
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST, authOptions };
