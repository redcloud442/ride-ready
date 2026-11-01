import { z } from "zod";

const DAY = 86_400_000;

// The client sends instants for its own local period boundaries, so time zones are its call.
// Default: the last 30 days.
export const statsQuerySchema = z
  .object({ from: z.coerce.date().optional(), to: z.coerce.date().optional() })
  .transform(({ from, to }) => {
    const end = to ?? new Date();
    return { start: from ?? new Date(end.getTime() - 30 * DAY), end };
  })
  .refine((p) => p.start < p.end, { message: "must be before to", path: ["from"] })
  .refine((p) => p.end.getTime() - p.start.getTime() <= 5 * 366 * DAY, {
    message: "period can be at most 5 years",
    path: ["from"],
  });

export type StatsQuery = z.infer<typeof statsQuerySchema>;
