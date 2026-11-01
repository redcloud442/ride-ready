import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../config/env.ts";
import { PrismaClient } from "../generated/prisma/client.ts";

export const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: env.databaseUrl }),
});
