/*
  Warnings:

  - The values [FIXED] on the enum `DiscountType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `otp_hash` on the `otp_requests` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `email_verifications` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mail_domain` to the `email_senders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `otp_encrypted` to the `otp_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DiscountType_new" AS ENUM ('PERCENTAGE', 'FLAT_AMOUNT', 'FLAT_CREDIT');
ALTER TABLE "public"."promo_codes" ALTER COLUMN "discountType" DROP DEFAULT;
ALTER TABLE "promo_codes" ALTER COLUMN "discountType" TYPE "DiscountType_new" USING ("discountType"::text::"DiscountType_new");
ALTER TYPE "DiscountType" RENAME TO "DiscountType_old";
ALTER TYPE "DiscountType_new" RENAME TO "DiscountType";
DROP TYPE "public"."DiscountType_old";
ALTER TABLE "promo_codes" ALTER COLUMN "discountType" SET DEFAULT 'PERCENTAGE';
COMMIT;

-- AlterEnum
ALTER TYPE "SubscriptionStatus" ADD VALUE 'GRACE_PERIOD';

-- AlterTable
ALTER TABLE "api_keys" ADD COLUMN     "credit_cap" INTEGER;

-- AlterTable
ALTER TABLE "email_senders" ADD COLUMN     "domain_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mail_domain" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "email_verifications" ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "otp_requests" DROP COLUMN "otp_hash",
ADD COLUMN     "lastResentAt" TIMESTAMP(3),
ADD COLUMN     "otp_encrypted" TEXT NOT NULL,
ADD COLUMN     "resentCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "promo_codes" ADD COLUMN     "bonus_credits" INTEGER,
ADD COLUMN     "expiry_date" TIMESTAMP(3),
ADD COLUMN     "flat_discount" DECIMAL(12,2),
ALTER COLUMN "discountValue" DROP NOT NULL;

-- AlterTable
ALTER TABLE "usage_logs" ADD COLUMN     "current_api_calls" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "current_blogs_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "current_push_sent" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "workspace_subscriptions" ADD COLUMN     "grace_period_end" TIMESTAMP(3),
ADD COLUMN     "plan_id" TEXT;

-- AlterTable
ALTER TABLE "workspaces" ADD COLUMN     "apiLimit" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "auto_top_up_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "auto_top_up_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "auto_top_up_threshold" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "blogLimit" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "current_api_calls" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "current_blogs_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "current_push_sent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "grace_period_until" TIMESTAMP(3),
ADD COLUMN     "pushLimit" INTEGER NOT NULL DEFAULT 100,
ALTER COLUMN "subscriberLimit" SET DEFAULT 100;

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL,
    "description" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "interval" TEXT NOT NULL DEFAULT 'month',
    "email_credits" INTEGER NOT NULL DEFAULT 0,
    "sms_credits" INTEGER NOT NULL DEFAULT 0,
    "otp_credits" INTEGER NOT NULL DEFAULT 0,
    "storage_credits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "extra_credit_rate" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "roll_over_credits" BOOLEAN NOT NULL DEFAULT false,
    "subscriberLimit" INTEGER NOT NULL DEFAULT 100,
    "emailLimit" INTEGER NOT NULL DEFAULT 500,
    "storageLimit" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "smsLimit" INTEGER NOT NULL DEFAULT 0,
    "otpLimit" INTEGER NOT NULL DEFAULT 0,
    "blogLimit" INTEGER NOT NULL DEFAULT 0,
    "pushLimit" INTEGER NOT NULL DEFAULT 0,
    "apiLimit" INTEGER NOT NULL DEFAULT 0,
    "features" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "paystack_plan_code" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL DEFAULT '',
    "workspace_id" TEXT NOT NULL,
    "balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "email_credits" INTEGER NOT NULL DEFAULT 0,
    "sms_credits" INTEGER NOT NULL DEFAULT 0,
    "otp_credits" INTEGER NOT NULL DEFAULT 0,
    "blog_credits" INTEGER NOT NULL DEFAULT 0,
    "push_credits" INTEGER NOT NULL DEFAULT 0,
    "api_credits" INTEGER NOT NULL DEFAULT 0,
    "storage_credits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_alerts" (
    "id" TEXT NOT NULL DEFAULT '',
    "workspace_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'info',
    "isDismissible" BOOLEAN NOT NULL DEFAULT true,
    "dismissed_at" TIMESTAMP(3),
    "link_url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspace_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_costs" (
    "id" TEXT NOT NULL DEFAULT '',
    "service" TEXT NOT NULL,
    "cost" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_costs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL DEFAULT '',
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "group" TEXT NOT NULL DEFAULT 'general',

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plans_name_key" ON "plans"("name");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_workspace_id_key" ON "wallets"("workspace_id");

-- CreateIndex
CREATE INDEX "workspace_alerts_workspace_id_idx" ON "workspace_alerts"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_costs_service_key" ON "service_costs"("service");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "email_verifications_email_key" ON "email_verifications"("email");

-- AddForeignKey
ALTER TABLE "workspace_subscriptions" ADD CONSTRAINT "workspace_subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_alerts" ADD CONSTRAINT "workspace_alerts_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
