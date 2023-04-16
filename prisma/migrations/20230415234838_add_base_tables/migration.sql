-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('Admin', 'Common');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "userType" "UserType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hero" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "placeOfBirth" TEXT NOT NULL,
    "universe" TEXT NOT NULL,
    "firstAppearance" TEXT NOT NULL,
    "combat" TEXT NOT NULL,
    "durability" TEXT NOT NULL,
    "intelligence" TEXT NOT NULL,
    "power" TEXT NOT NULL,
    "speed" TEXT NOT NULL,
    "strength" TEXT NOT NULL,
    "eyeColor" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "hairColor" TEXT NOT NULL,
    "race" TEXT NOT NULL,
    "height" TEXT[],
    "weight" TEXT[],

    CONSTRAINT "Hero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserHeroRate" (
    "id" SERIAL NOT NULL,
    "assessment" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "heroId" TEXT,

    CONSTRAINT "UserHeroRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "UserHeroRate" ADD CONSTRAINT "UserHeroRate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserHeroRate" ADD CONSTRAINT "UserHeroRate_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero"("id") ON DELETE SET NULL ON UPDATE CASCADE;
