/*
  Warnings:

  - The values [API] on the enum `Services` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `bundle_limit` on the `monthly_usages` table. All the data in the column will be lost.
  - You are about to drop the column `apiLimit` on the `plans` table. All the data in the column will be lost.
  - You are about to drop the column `email_credits` on the `plans` table. All the data in the column will be lost.
  - You are about to drop the column `extra_credit_rate` on the `plans` table. All the data in the column will be lost.
  - You are about to drop the column `otp_credits` on the `plans` table. All the data in the column will be lost.
  - You are about to drop the column `roll_over_credits` on the `plans` table. All the data in the column will be lost.
  - You are about to drop the column `sms_credits` on the `plans` table. All the data in the column will be lost.
  - You are about to drop the column `storage_credits` on the `plans` table. All the data in the column will be lost.
  - You are about to drop the column `api_credits` on the `wallets` table. All the data in the column will be lost.
  - You are about to drop the column `apiLimit` on the `workspaces` table. All the data in the column will be lost.
  - You are about to drop the column `current_api_calls` on the `workspaces` table. All the data in the column will be lost.
  - You are about to drop the column `current_files_used` on the `workspaces` table. All the data in the column will be lost.
  - You are about to drop the column `fileLimit` on the `workspaces` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Services_new" AS ENUM ('EMAIL', 'SMS', 'OTP', 'STORAGE', 'BLOG', 'PUSH', 'AI', 'SUBSCRIBERS');
ALTER TABLE "monthly_usages" ALTER COLUMN "service" TYPE "Services_new" USING ("service"::text::"Services_new");
ALTER TABLE "service_costs" ALTER COLUMN "service" TYPE "Services_new" USING ("service"::text::"Services_new");
ALTER TYPE "Services" RENAME TO "Services_old";
ALTER TYPE "Services_new" RENAME TO "Services";
DROP TYPE "public"."Services_old";
COMMIT;

-- AlterTable
ALTER TABLE "monthly_usages" DROP COLUMN "bundle_limit",
ADD COLUMN     "current_ai_calls" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "current_blogs_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "current_emails_sent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "current_otp_sent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "current_push_sent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "current_sms_sent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "current_storage_used" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "current_subscribers" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "plans" DROP COLUMN "apiLimit",
DROP COLUMN "email_credits",
DROP COLUMN "extra_credit_rate",
DROP COLUMN "otp_credits",
DROP COLUMN "roll_over_credits",
DROP COLUMN "sms_credits",
DROP COLUMN "storage_credits",
ADD COLUMN     "aiLimit" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "subscriberLimit" SET DEFAULT 0,
ALTER COLUMN "emailLimit" SET DEFAULT 0,
ALTER COLUMN "storageLimit" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "wallets" DROP COLUMN "api_credits",
ADD COLUMN     "ai_credits" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "workspaces" DROP COLUMN "apiLimit",
DROP COLUMN "current_api_calls",
DROP COLUMN "current_files_used",
DROP COLUMN "fileLimit",
ADD COLUMN     "aiLimit" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "current_ai_calls" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "current_storage_used" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "storageLimit" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "pushLimit" SET DEFAULT 2;
