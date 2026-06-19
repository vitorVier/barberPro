-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM ('HAIRCUT', 'BEARD', 'EYEBROW', 'HAIRCUT_BEARD', 'FULL_SERVICE', 'HAIR_TREATMENT', 'COLORING', 'OTHER');

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "category" "ServiceCategory" NOT NULL DEFAULT 'OTHER';
