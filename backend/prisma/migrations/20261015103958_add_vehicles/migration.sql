-- CreateTable
CREATE TABLE "vehicles" (
    "id" SERIAL NOT NULL,
    "vehicleNumber" TEXT NOT NULL,
    "normalizedNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "constituencyIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "vehicleType" TEXT NOT NULL,
    "capacityTons" DOUBLE PRECISION NOT NULL,
    "vehiclePhoto" TEXT,
    "rcDocument" TEXT,
    "fitnessDocument" TEXT,
    "insuranceDocument" TEXT,
    "driverName" TEXT NOT NULL,
    "driverPhone" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "licensePhoto" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vehicleNumber_key" ON "vehicles"("vehicleNumber");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_normalizedNumber_key" ON "vehicles"("normalizedNumber");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_driverPhone_key" ON "vehicles"("driverPhone");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_licenseNumber_key" ON "vehicles"("licenseNumber");

-- CreateIndex
CREATE INDEX "vehicles_userId_idx" ON "vehicles"("userId");

-- CreateIndex
CREATE INDEX "vehicles_vehicleNumber_idx" ON "vehicles"("vehicleNumber");

-- CreateIndex
CREATE INDEX "vehicles_driverPhone_idx" ON "vehicles"("driverPhone");

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
