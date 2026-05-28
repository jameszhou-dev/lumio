-- CreateEnum
CREATE TYPE "ContextType" AS ENUM ('MENU', 'HOURS', 'FAQ', 'CALENDAR', 'POLICY', 'OTHER');

-- CreateTable
CREATE TABLE "businesses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contexts" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "type" "ContextType" NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contexts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contexts_businessId_idx" ON "contexts"("businessId");

-- AddForeignKey
ALTER TABLE "contexts" ADD CONSTRAINT "contexts_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
