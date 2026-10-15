-- AlterEnum
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'VEHICLE';

-- DropTable
DROP TABLE IF EXISTS "User";

-- CreateTable
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "corporationIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "constituencyIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "wardIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "corporations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nameKn" TEXT,
    "boneMerchantId" TEXT,
    "meatMerchantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corporations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "constituencies" (
    "id" SERIAL NOT NULL,
    "corporationId" INTEGER NOT NULL,
    "acNo" INTEGER,
    "name" TEXT NOT NULL,
    "nameKn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "constituencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "wards" (
    "id" SERIAL NOT NULL,
    "constituencyId" INTEGER NOT NULL,
    "wardNumber" INTEGER,
    "name" TEXT NOT NULL,
    "nameKn" TEXT,
    "boundry" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "constituencies_corporationId_idx" ON "constituencies"("corporationId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "wards_constituencyId_idx" ON "wards"("constituencyId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "wards_wardNumber_idx" ON "wards"("wardNumber");

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'constituencies_corporationId_fkey'
    ) THEN
        ALTER TABLE "constituencies" ADD CONSTRAINT "constituencies_corporationId_fkey" FOREIGN KEY ("corporationId") REFERENCES "corporations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'wards_constituencyId_fkey'
    ) THEN
        ALTER TABLE "wards" ADD CONSTRAINT "wards_constituencyId_fkey" FOREIGN KEY ("constituencyId") REFERENCES "constituencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
