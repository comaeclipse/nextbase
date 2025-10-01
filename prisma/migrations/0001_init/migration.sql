-- CreateTable
CREATE TABLE "Destination" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "climate" TEXT[],
    "taxBand" TEXT NOT NULL,
    "costOfLivingIndex" INTEGER NOT NULL,
    "lifestyle" TEXT[],
    "techPresence" TEXT NOT NULL,
    "gunLaws" TEXT NOT NULL,
    "vaResourcesScore" INTEGER NOT NULL,
    "healthcareIndex" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "highlights" TEXT[],
    "heroImage" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Destination_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Destination_region_idx" ON "Destination"("region");

-- CreateIndex
CREATE INDEX "Destination_taxBand_idx" ON "Destination"("taxBand");

-- CreateIndex
CREATE INDEX "Destination_techPresence_idx" ON "Destination"("techPresence");

