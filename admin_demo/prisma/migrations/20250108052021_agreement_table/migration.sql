-- CreateTable
CREATE TABLE "upload" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "test" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "created_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "upload_pkey" PRIMARY KEY ("id")
);
