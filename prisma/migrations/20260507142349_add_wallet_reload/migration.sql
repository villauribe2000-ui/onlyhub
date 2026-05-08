-- CreateTable
CREATE TABLE "WalletReload" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "WalletReload_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WalletReload" ADD CONSTRAINT "WalletReload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "WalletReload_userId_idx" ON "WalletReload"("userId");

-- CreateIndex
CREATE INDEX "WalletReload_status_idx" ON "WalletReload"("status");
