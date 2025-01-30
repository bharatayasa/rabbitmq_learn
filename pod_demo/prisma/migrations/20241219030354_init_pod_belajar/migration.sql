-- CreateTable
CREATE TABLE "pod" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "fk_user_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "identification" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "pod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "link_class" TEXT NOT NULL,
    "icon_class" TEXT NOT NULL,
    "icon_name" TEXT NOT NULL,
    "menu_name" TEXT NOT NULL,
    "information" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detail_experience" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "stroboscopic_light" SMALLINT NOT NULL,
    "audio_surround_sound" SMALLINT NOT NULL,
    "vibro_acoustics" SMALLINT NOT NULL,
    "led_intensity" SMALLINT NOT NULL,
    "led_color" SMALLINT NOT NULL,
    "sound_scape" INTEGER NOT NULL,
    "infra_red_nea_ir" SMALLINT NOT NULL,
    "infra_red_far_ir" SMALLINT NOT NULL,
    "pemf_therapy" BOOLEAN NOT NULL,
    "olfactory_engagement" BOOLEAN NOT NULL,
    "binaural_beats_isochronic_tones" BOOLEAN NOT NULL,
    "direct_neutral_stimulation" BOOLEAN NOT NULL,
    "duration" DECIMAL(5,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "experience_id" UUID NOT NULL,

    CONSTRAINT "detail_experience_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pod_idx" ON "pod"("id", "fk_user_id");

-- CreateIndex
CREATE INDEX "experience_idx" ON "experiences"("id");

-- CreateIndex
CREATE INDEX "detail_experience_idx" ON "detail_experience"("id");

-- AddForeignKey
ALTER TABLE "detail_experience" ADD CONSTRAINT "detail_experience_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "experiences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
