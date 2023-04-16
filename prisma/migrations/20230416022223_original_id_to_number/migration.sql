/*
  Warnings:

  - Changed the type of `originalId` on the `Hero` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Hero" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "originalId",
ADD COLUMN     "originalId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Hero_originalId_key" ON "Hero"("originalId");
