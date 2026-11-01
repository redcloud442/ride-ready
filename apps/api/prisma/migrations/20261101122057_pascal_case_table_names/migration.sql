-- Table names follow their models (PascalCase). Renamed in place so no rows are lost;
-- Prisma Migrate would have dropped and recreated these tables.

-- User
ALTER TABLE "user" RENAME TO "User";
ALTER TABLE "User" RENAME CONSTRAINT "user_pkey" TO "User_pkey";
ALTER INDEX "user_email_key" RENAME TO "User_email_key";

-- Session
ALTER TABLE "session" RENAME TO "Session";
ALTER TABLE "Session" RENAME CONSTRAINT "session_pkey" TO "Session_pkey";
ALTER TABLE "Session" RENAME CONSTRAINT "session_userId_fkey" TO "Session_userId_fkey";
ALTER INDEX "session_token_key" RENAME TO "Session_token_key";
ALTER INDEX "session_userId_idx" RENAME TO "Session_userId_idx";

-- Account
ALTER TABLE "account" RENAME TO "Account";
ALTER TABLE "Account" RENAME CONSTRAINT "account_pkey" TO "Account_pkey";
ALTER TABLE "Account" RENAME CONSTRAINT "account_userId_fkey" TO "Account_userId_fkey";
ALTER INDEX "account_userId_idx" RENAME TO "Account_userId_idx";

-- Verification
ALTER TABLE "verification" RENAME TO "Verification";
ALTER TABLE "Verification" RENAME CONSTRAINT "verification_pkey" TO "Verification_pkey";
ALTER INDEX "verification_identifier_idx" RENAME TO "Verification_identifier_idx";

-- Organization
ALTER TABLE "organization" RENAME TO "Organization";
ALTER TABLE "Organization" RENAME CONSTRAINT "organization_pkey" TO "Organization_pkey";
ALTER INDEX "organization_slug_key" RENAME TO "Organization_slug_key";

-- Member
ALTER TABLE "member" RENAME TO "Member";
ALTER TABLE "Member" RENAME CONSTRAINT "member_pkey" TO "Member_pkey";
ALTER TABLE "Member" RENAME CONSTRAINT "member_organizationId_fkey" TO "Member_organizationId_fkey";
ALTER TABLE "Member" RENAME CONSTRAINT "member_userId_fkey" TO "Member_userId_fkey";
ALTER INDEX "member_organizationId_idx" RENAME TO "Member_organizationId_idx";
ALTER INDEX "member_userId_idx" RENAME TO "Member_userId_idx";

-- Invitation
ALTER TABLE "invitation" RENAME TO "Invitation";
ALTER TABLE "Invitation" RENAME CONSTRAINT "invitation_pkey" TO "Invitation_pkey";
ALTER TABLE "Invitation" RENAME CONSTRAINT "invitation_inviterId_fkey" TO "Invitation_inviterId_fkey";
ALTER TABLE "Invitation" RENAME CONSTRAINT "invitation_organizationId_fkey" TO "Invitation_organizationId_fkey";
ALTER INDEX "invitation_email_idx" RENAME TO "Invitation_email_idx";
ALTER INDEX "invitation_organizationId_idx" RENAME TO "Invitation_organizationId_idx";
