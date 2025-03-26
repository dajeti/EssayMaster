import prisma from "@/lib/prisma"; // Prisma client instance
import { getSession } from "next-auth/react"; // To get the session

// pages/api/userData.js
export default async function handler(req, res) {
    const session = await getSession({ req });

    if (!session || !session.user?.firstName) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.firstName }, // Use user.id here, not firstName
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            firstName: user.firstName,
            lastName: user.lastName,
        });
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
