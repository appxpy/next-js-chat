import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "~/server/auth";
import {prisma} from "~/server/db";

const sendMessageSchema = z.object({
  text: z.string(),
  receiverId: z.string(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user) {
    return res.status(403).end();
  }

  try {
    const { text, receiverId } = sendMessageSchema.parse(req.body);
    const senderId = session.user.id;

    const message = await prisma.message.create({
      data: {
        text,
        sender: { connect: { id: senderId } },
        receiver: { connect: { id: receiverId } },
      },
    });

    return res.json({ message });
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
