/*
  Warnings:

  - Added the required column `updatedAt` to the `BatteryHealthRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BatteryHealthRecord" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "BatteryHealthRecord_vehicleId_measuredAt_idx" ON "BatteryHealthRecord"("vehicleId", "measuredAt");
