-- CreateTable
CREATE TABLE "plants" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "corporationId" INTEGER NOT NULL,
    "constituencyId" INTEGER NOT NULL,
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "plants_corporationId_idx" ON "plants"("corporationId");

-- CreateIndex
CREATE INDEX "plants_constituencyId_idx" ON "plants"("constituencyId");

-- AddForeignKey
ALTER TABLE "plants" ADD CONSTRAINT "plants_corporationId_fkey" FOREIGN KEY ("corporationId") REFERENCES "corporations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plants" ADD CONSTRAINT "plants_constituencyId_fkey" FOREIGN KEY ("constituencyId") REFERENCES "constituencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
