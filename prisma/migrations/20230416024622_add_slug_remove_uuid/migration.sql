/*
  Warnings:

  - The primary key for the `Hero` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `originalId` on the `Hero` table. All the data in the column will be lost.
  - The `heroId` column on the `UserHeroRate` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[id]` on the table `Hero` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Hero` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Hero` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `Hero` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "UserHeroRate" DROP CONSTRAINT "UserHeroRate_heroId_fkey";

-- DropIndex
DROP INDEX "Hero_originalId_key";

-- AlterTable
ALTER TABLE "Hero" DROP CONSTRAINT "Hero_pkey",
DROP COLUMN "originalId",
ADD COLUMN     "slug" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "UserHeroRate" DROP COLUMN "heroId",
ADD COLUMN     "heroId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Hero_id_key" ON "Hero"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Hero_slug_key" ON "Hero"("slug");

-- AddForeignKey
ALTER TABLE "UserHeroRate" ADD CONSTRAINT "UserHeroRate_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero"("id") ON DELETE SET NULL ON UPDATE CASCADE;
