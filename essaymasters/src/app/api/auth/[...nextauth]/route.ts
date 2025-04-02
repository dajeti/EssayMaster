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
          select: {
            id: true,
            email: true,
            firstName: true, // Ensure firstname is selected
            lastName: true,  // Ensure lastname is selected
            password: true
          },
        });

        if (!user) throw new Error("No user found");

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid password");

        return { id: user.id, email: user.email , firstname: user.firstName , lastname: user.lastName };
      },
    }),
  ],

  callbacks: {
    async session({ session, token }) {
      // Ensure the correct casing for token properties
      if (token.sub) {
        session.user = {
          id: token.sub,
          email: token.email,
          firstName: token.firstName, // Ensure lowercase consistency
          lastName: token.lastName,   // Ensure lowercase consistency
        };
      }
      // console.log(session);
      return session;
    },

    async jwt({ token, user }) {
      // Ensure consistency between JWT and session token
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.firstName = user.firstName; // Ensure lowercase consistency
        token.lastName = user.lastName;   // Ensure lowercase consistency
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
