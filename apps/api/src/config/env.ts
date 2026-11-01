// Single place that reads process.env. Fails fast at boot instead of on first request.
function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var ${name} (see apps/api/.env.example)`);
  return value;
}

const list = (value: string | undefined) =>
  (value ?? "").split(",").map((s) => s.trim()).filter(Boolean);

export const env = {
  isProduction: process.env.NODE_ENV === "production",
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: required("DATABASE_URL"),
  // Better Auth falls back to a public default secret outside production, so require it everywhere
  authSecret: required("BETTER_AUTH_SECRET"),
  corsOrigins: list(process.env.CORS_ORIGINS),
  s3: {
    endpoint: required("S3_ENDPOINT"),
    // host the phone can reach (e.g. the dev machine's LAN IP); presigned URLs are signed for it
    publicEndpoint: process.env.S3_PUBLIC_ENDPOINT || required("S3_ENDPOINT"),
    accessKey: required("S3_ACCESS_KEY"),
    secretKey: required("S3_SECRET_KEY"),
    bucket: process.env.S3_BUCKET || "ride-ready-private",
  },
  google:
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET }
      : undefined,
};
