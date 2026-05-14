/*
  Warnings:

  - You are about to drop the column `mail_domain` on the `email_senders` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `service_costs` table. All the data in the column will be lost.
  - You are about to alter the column `cost` on the `service_costs` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(10,4)`.
  - Added the required column `updated_at` to the `service_costs` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `service` on the `service_costs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Services" AS ENUM ('EMAIL', 'SMS', 'OTP', 'STORAGE', 'BLOG', 'PUSH', 'API', 'SUBSCRIBERS');

-- AlterEnum
ALTER TYPE "SubscriptionTransactionType" ADD VALUE 'TOPUP';

-- AlterTable
ALTER TABLE "blog_posts" ADD COLUMN     "is_approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_featured" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "email_senders" DROP COLUMN "mail_domain",
ADD COLUMN     "dkim_tokens" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "dmarc_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_domain" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "spf_record" TEXT;

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "billing_email" TEXT,
ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "plans" ADD COLUMN     "devApiAccess" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "service_costs" DROP COLUMN "updatedAt",
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "min_purchase" DECIMAL(10,4) NOT NULL DEFAULT 1.0,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "usage_rate" DECIMAL(10,4) NOT NULL DEFAULT 1.0,
DROP COLUMN "service",
ADD COLUMN     "service" "Services" NOT NULL,
ALTER COLUMN "cost" SET DEFAULT 1.0,
ALTER COLUMN "cost" SET DATA TYPE DECIMAL(10,4);

-- AlterTable
ALTER TABLE "workspaces" ALTER COLUMN "fileLimit" SET DEFAULT 1,
ALTER COLUMN "smsLimit" SET DEFAULT 0,
ALTER COLUMN "otpLimit" SET DEFAULT 10;

-- CreateTable
CREATE TABLE "sender_otps" (
    "id" TEXT NOT NULL DEFAULT '',
    "email_sender_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sender_otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_otps" (
    "id" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL,
    "otp_hash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 3,
    "status" "OtpStatus" NOT NULL DEFAULT 'PENDING',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "verified_at" TIMESTAMP(3),
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_usages" (
    "id" TEXT NOT NULL DEFAULT '',
    "workspace_id" TEXT NOT NULL,
    "service" "Services" NOT NULL,
    "month" TEXT NOT NULL,
    "units_used" INTEGER NOT NULL DEFAULT 0,
    "bundle_limit" INTEGER NOT NULL DEFAULT 0,
    "top_up_units_used" INTEGER NOT NULL DEFAULT 0,
    "top_up_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_items" (
    "id" TEXT NOT NULL DEFAULT '',
    "invoice_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sender_otps_email_sender_id_idx" ON "sender_otps"("email_sender_id");

-- CreateIndex
CREATE INDEX "auth_otps_email_idx" ON "auth_otps"("email");

-- CreateIndex
CREATE INDEX "auth_otps_status_idx" ON "auth_otps"("status");

-- CreateIndex
CREATE INDEX "auth_otps_expires_at_idx" ON "auth_otps"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_usages_workspace_id_service_month_key" ON "monthly_usages"("workspace_id", "service", "month");

-- CreateIndex
CREATE INDEX "invoice_items_invoice_id_idx" ON "invoice_items"("invoice_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_costs_service_key" ON "service_costs"("service");

-- AddForeignKey
ALTER TABLE "sender_otps" ADD CONSTRAINT "sender_otps_email_sender_id_fkey" FOREIGN KEY ("email_sender_id") REFERENCES "email_senders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_usages" ADD CONSTRAINT "monthly_usages_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
