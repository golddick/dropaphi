-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('EMAIL', 'DISCORD', 'TWITTER', 'GITHUB', 'OTHER');

-- CreateEnum
CREATE TYPE "DemoCategory" AS ENUM ('SMS', 'Email', 'OTP / 2FA', 'File Storage', 'Push ', 'Blog');

-- CreateTable
CREATE TABLE "demo_videos" (
    "id" TEXT NOT NULL,
    "category" "DemoCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "duration" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "tagColor" TEXT NOT NULL,
    "src" TEXT NOT NULL,
    "poster" TEXT NOT NULL,
    "steps" JSONB NOT NULL,
    "code_snippet" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demo_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_files" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "name" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" DOUBLE PRECISION NOT NULL,
    "storage_key" TEXT NOT NULL,
    "cdn_url" TEXT NOT NULL,
    "direct_url" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaints" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'OPEN',
    "replies" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "complaints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_info" (
    "id" TEXT NOT NULL,
    "type" "ContactType" NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_status" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'operational',
    "message" TEXT,
    "last_checked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "demo_videos_category_idx" ON "demo_videos"("category");

-- CreateIndex
CREATE INDEX "demo_videos_is_published_idx" ON "demo_videos"("is_published");

-- CreateIndex
CREATE INDEX "demo_videos_is_featured_idx" ON "demo_videos"("is_featured");

-- CreateIndex
CREATE INDEX "demo_videos_sort_order_idx" ON "demo_videos"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "platform_files_storage_key_key" ON "platform_files"("storage_key");

-- CreateIndex
CREATE INDEX "platform_files_user_id_idx" ON "platform_files"("user_id");

-- CreateIndex
CREATE INDEX "platform_files_type_idx" ON "platform_files"("type");

-- CreateIndex
CREATE INDEX "platform_files_entity_type_idx" ON "platform_files"("entity_type");

-- CreateIndex
CREATE INDEX "platform_files_entity_id_idx" ON "platform_files"("entity_id");

-- CreateIndex
CREATE INDEX "complaints_user_id_idx" ON "complaints"("user_id");

-- CreateIndex
CREATE INDEX "complaints_status_idx" ON "complaints"("status");

-- CreateIndex
CREATE INDEX "complaints_created_at_idx" ON "complaints"("created_at");

-- CreateIndex
CREATE INDEX "contact_info_type_idx" ON "contact_info"("type");

-- CreateIndex
CREATE INDEX "contact_info_isActive_idx" ON "contact_info"("isActive");

-- CreateIndex
CREATE INDEX "contact_info_sortOrder_idx" ON "contact_info"("sortOrder");

-- AddForeignKey
ALTER TABLE "platform_files" ADD CONSTRAINT "platform_files_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
