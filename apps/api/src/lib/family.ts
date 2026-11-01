import { db } from "./db.ts";

// Whose garages a user can open: their own, plus the owner's of every family (Better Auth organization)
// they belong to. Members get full access to those vehicles and their records; only the owner can
// edit or delete the vehicle itself (modules/vehicles).
export async function garageOwnerIds(userId: string) {
  const owners = await db.member.findMany({
    where: { role: "owner", organization: { members: { some: { userId } } } },
    select: { userId: true },
  });
  return [...new Set([userId, ...owners.map((o) => o.userId)])];
}
