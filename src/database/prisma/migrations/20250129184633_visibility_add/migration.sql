-- CreateEnum
CREATE TYPE "ProductVisibility" AS ENUM ('DRAFT', 'VISIBLE', 'HIDDEN', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "visibility" "ProductVisibility" NOT NULL DEFAULT 'DRAFT';
