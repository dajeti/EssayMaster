import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const sessions = await prisma.session.findMany();
  res.status(200).json(sessions);
}
