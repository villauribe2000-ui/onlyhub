-- AlterTable
ALTER TABLE "WalletReload" ADD COLUMN "paypalPaymentId" TEXT,
ADD COLUMN "receiptUrl" TEXT;

-- CreateIndex
CREATE INDEX "WalletReload_paypalPaymentId_idx" ON "WalletReload"("paypalPaymentId");

-- CreateIndex
CREATE INDEX "WalletReload_receiptUrl_idx" ON "WalletReload"("receiptUrl");
