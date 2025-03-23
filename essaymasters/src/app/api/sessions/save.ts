import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { sessionId, essay, chat, feedback, markScheme } = req.body;

  const session = await prisma.session.upsert({
    where: { id: sessionId },
    update: { essay, chat, feedback, markScheme },
    create: { id: sessionId, essay, chat, feedback, markScheme },
  });

  res.status(200).json(session);
}
