/*
  Warnings:

  - You are about to drop the column `unitOfMeasureId` on the `VolumeConversion` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "VolumeConversion" DROP CONSTRAINT "VolumeConversion_unitOfMeasureId_fkey";

-- AlterTable
ALTER TABLE "VolumeConversion" DROP COLUMN "unitOfMeasureId";

-- AddForeignKey
ALTER TABLE "VolumeConversion" ADD CONSTRAINT "VolumeConversion_stdVolId_fkey" FOREIGN KEY ("stdVolId") REFERENCES "UnitOfMeasure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
