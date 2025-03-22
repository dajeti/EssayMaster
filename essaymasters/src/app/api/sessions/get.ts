import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const sessions = await prisma.session.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
}
