-- AlterTable: Adicionar configurações da seção de equipe em site_settings
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "teamSectionPosition" TEXT NOT NULL DEFAULT 'AFTER_ABOUT';
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "teamSectionTitle" TEXT NOT NULL DEFAULT 'Nossa Equipe';
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "teamSectionSubtitle" TEXT NOT NULL DEFAULT 'Conheça os docentes, servidores e estudantes que constroem o SOU+UAST';

-- CreateTable: team_members
CREATE TABLE IF NOT EXISTS "team_members" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "projectRole" TEXT NOT NULL,
    "photoUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "team_members_isActive_order_idx" ON "team_members"("isActive", "order");
