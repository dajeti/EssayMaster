import { PrismaClient } from "@prisma/client";

// Ensure a single instance of PrismaClient for the app
const prisma = new PrismaClient();

export default prisma;
