import "./globals.css";
import ClientLayout from "./clientLayout";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";

export const metadata = {
  title: "Essay Master",
  description: "A platform for essay assistance",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions); // Fetch session on the server

  return (
    <html lang="en">
      <body className="bg-white dark:bg-black min-h-screen">
        <ClientLayout session={session}>{children}</ClientLayout> {/* Pass session */}
      </body>
    </html>
  );
}

