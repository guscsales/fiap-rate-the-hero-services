/*
  Warnings:

  - You are about to drop the column `fullName` on the `Hero` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[originalId]` on the table `Hero` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `originalId` to the `Hero` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Hero" DROP COLUMN "fullName",
ADD COLUMN     "originalId" TEXT NOT NULL,
ADD COLUMN     "pictureURL" TEXT,
ADD COLUMN     "secretIdentity" TEXT,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "placeOfBirth" DROP NOT NULL,
ALTER COLUMN "universe" DROP NOT NULL,
ALTER COLUMN "firstAppearance" DROP NOT NULL,
ALTER COLUMN "combat" DROP NOT NULL,
ALTER COLUMN "durability" DROP NOT NULL,
ALTER COLUMN "intelligence" DROP NOT NULL,
ALTER COLUMN "power" DROP NOT NULL,
ALTER COLUMN "speed" DROP NOT NULL,
ALTER COLUMN "strength" DROP NOT NULL,
ALTER COLUMN "eyeColor" DROP NOT NULL,
ALTER COLUMN "gender" DROP NOT NULL,
ALTER COLUMN "hairColor" DROP NOT NULL,
ALTER COLUMN "race" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Hero_originalId_key" ON "Hero"("originalId");
