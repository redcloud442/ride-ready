import { statsQuerySchema, type StatsQuery } from "../stats/stats.schema.ts";

// Same period rules as GET /stats (default: last 30 days).
export const generateInsightSchema = statsQuerySchema;
export type GenerateInsightInput = StatsQuery;
