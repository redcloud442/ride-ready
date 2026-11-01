import { buildApp } from "./app.ts";
import { env } from "./config/env.ts";
import { ensureBucket } from "./lib/storage.ts";

await ensureBucket();
const app = await buildApp();
await app.listen({ port: env.port, host: "0.0.0.0" });
