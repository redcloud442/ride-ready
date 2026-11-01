/*
  Warnings:

  - Added the required column `updatedAt` to the `VehicleDocument` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VehicleDocument" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "VehicleDocument_vehicleId_createdAt_idx" ON "VehicleDocument"("vehicleId", "createdAt");
