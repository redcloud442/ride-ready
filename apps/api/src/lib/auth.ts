import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { organization } from "better-auth/plugins";
import { env } from "../config/env.ts";
import { db } from "./db.ts";
import { preferencesSchema } from "./schemas.ts";
import { deleteObjects } from "./storage.ts";

// Endpoints that set a password, and the body field carrying it.
const PASSWORD_FIELD: Record<string, string> = {
  "/sign-up/email": "password",
  "/reset-password": "newPassword",
  "/change-password": "newPassword",
};

const bad = (message: string) => new APIError("BAD_REQUEST", { message });

export const auth = betterAuth({
  secret: env.authSecret,
  database: prismaAdapter(db, { provider: "postgresql" }),
  // Better Auth enforces length (8–128) itself
  emailAndPassword: { enabled: true },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // letter + number rule mirrors apps/mobile signUpSchema, so calls straight to the API can't skip it
      const field = PASSWORD_FIELD[ctx.path];
      const password = field ? ctx.body?.[field] : undefined;
      if (typeof password === "string" && !(/[A-Za-z]/.test(password) && /\d/.test(password))) {
        throw bad("Password must include a letter and a number");
      }
      if (ctx.path === "/update-user") {
        // image holds a private storage key set by POST /api/profile/avatar; a client-chosen value could
        // point at someone else's file
        if (ctx.body?.image !== undefined) throw bad("Set the photo through /api/profile/avatar");
        if (ctx.body?.preferences !== undefined) {
          const parsed = preferencesSchema.safeParse(ctx.body.preferences);
          if (!parsed.success) throw bad(`preferences: ${parsed.error.issues[0].message}`);
          ctx.body.preferences = parsed.data;
        }
      }
      // Family members join as "member" only. An owner/admin role would also share the invitee's own
      // garage (see lib/family.ts), which they never agreed to.
      if (ctx.path === "/organization/invite-member" && ctx.body?.role !== "member") {
        throw bad("Family members are invited with the member role");
      }
      if (ctx.path === "/organization/update-member-role") throw bad("Family roles can't be changed");
    }),
  },
  // Google is enabled only when credentials are configured; otherwise Better Auth rejects the provider.
  socialProviders: env.google ? { google: env.google } : {},
  user: {
    additionalFields: {
      // set by POST /api/onboarding, never by the client directly
      onboardedAt: { type: "date", required: false, input: false },
      // validated against preferencesSchema in the before hook
      preferences: { type: "json", required: false, input: true },
    },
    // No email sender yet, so only unverified addresses (email sign-ups) can change directly. Google
    // accounts have verified emails and get an error until sendChangeEmailConfirmation is configured.
    changeEmail: { enabled: true, updateEmailWithoutVerification: true },
    deleteUser: {
      enabled: true,
      // rows go by onDelete: Cascade; files in storage don't, so remove them first
      beforeDelete: async (user) => {
        const docs = await db.vehicleDocument.findMany({ where: { vehicle: { userId: user.id } }, select: { storageKey: true } });
        const keys = docs.map((d) => d.storageKey);
        if (user.image?.startsWith("avatars/")) keys.push(user.image);
        await deleteObjects(keys);
        // the family they own has nothing left to share
        await db.organization.deleteMany({ where: { members: { some: { userId: user.id, role: "owner" } } } });
      },
    },
  },
  plugins: [
    expo(),
    // A family is an organization: its owner's whole garage is shared with every member (lib/family.ts).
    organization({
      teams: { enabled: false },
      // one family you own; joining other families is unlimited
      allowUserToCreateOrganization: async (user) => !(await db.member.findFirst({ where: { userId: user.id, role: "owner" } })),
      invitationExpiresIn: 7 * 24 * 60 * 60,
      // no email sender: the app shares the invitation id as a link / QR. Accepting still requires
      // signing in with the invited email address, so a forwarded link is useless to anyone else.
    }),
  ],
  // the mobile app's deep-link scheme (apps/mobile/app.json); exp:// is Expo Go in dev
  trustedOrigins: ["rideready://", ...(env.isProduction ? [] : ["exp://"])],
});

export type SessionUser = typeof auth.$Infer.Session.user;
