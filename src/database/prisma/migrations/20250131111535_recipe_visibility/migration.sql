/*
  Warnings:

  - The `visibility` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "VisibilityType" AS ENUM ('DRAFT', 'VISIBLE', 'HIDDEN', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "visibility",
ADD COLUMN     "visibility" "VisibilityType" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "visibility" "VisibilityType" NOT NULL DEFAULT 'DRAFT';

-- DropEnum
DROP TYPE "ProductVisibility";
