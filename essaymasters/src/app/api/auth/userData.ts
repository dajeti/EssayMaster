import prisma from "@/lib/prisma"; // Prisma client instance
import { getSession } from "next-auth/react"; // To get the session

export default async function handler(req, res) {
  // Get the session data to get the user's ID
  const session = await getSession({ req });

  if (!session || !session.user?.id) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    // Fetch the user data based on the user ID from the session
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send back the user's first and last name
    res.status(200).json({
      firstName: user.firstName,
      lastName: user.lastName,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
