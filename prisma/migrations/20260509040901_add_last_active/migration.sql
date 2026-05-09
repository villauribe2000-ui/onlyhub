/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "FollowerMilestone" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "milestone" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FollowerMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaqueClaim" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "milestone" INTEGER NOT NULL,
    "nameOnPlaque" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlaqueClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostViewAdjustment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostViewAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowerAdjustment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FollowerAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EarningsAdjustment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EarningsAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialLink" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icon" TEXT,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FollowerMilestone_userId_idx" ON "FollowerMilestone"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FollowerMilestone_userId_milestone_key" ON "FollowerMilestone"("userId", "milestone");

-- CreateIndex
CREATE INDEX "PlaqueClaim_userId_idx" ON "PlaqueClaim"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaqueClaim_userId_milestone_key" ON "PlaqueClaim"("userId", "milestone");

-- CreateIndex
CREATE INDEX "PostViewAdjustment_postId_idx" ON "PostViewAdjustment"("postId");

-- CreateIndex
CREATE INDEX "PostViewAdjustment_createdAt_idx" ON "PostViewAdjustment"("createdAt");

-- CreateIndex
CREATE INDEX "FollowerAdjustment_userId_idx" ON "FollowerAdjustment"("userId");

-- CreateIndex
CREATE INDEX "FollowerAdjustment_createdAt_idx" ON "FollowerAdjustment"("createdAt");

-- CreateIndex
CREATE INDEX "EarningsAdjustment_userId_idx" ON "EarningsAdjustment"("userId");

-- CreateIndex
CREATE INDEX "EarningsAdjustment_createdAt_idx" ON "EarningsAdjustment"("createdAt");

-- CreateIndex
CREATE INDEX "SocialLink_userId_idx" ON "SocialLink"("userId");

-- CreateIndex
CREATE INDEX "SocialLink_order_idx" ON "SocialLink"("order");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "FollowerMilestone" ADD CONSTRAINT "FollowerMilestone_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaqueClaim" ADD CONSTRAINT "PlaqueClaim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostViewAdjustment" ADD CONSTRAINT "PostViewAdjustment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowerAdjustment" ADD CONSTRAINT "FollowerAdjustment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EarningsAdjustment" ADD CONSTRAINT "EarningsAdjustment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialLink" ADD CONSTRAINT "SocialLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
