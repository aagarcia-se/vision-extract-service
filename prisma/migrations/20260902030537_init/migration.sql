-- CreateTable
CREATE TABLE "extractions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "templateUsed" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "rawResult" JSONB,
    "mappedResult" JSONB,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "extractions_clientId_idx" ON "extractions"("clientId");

-- CreateIndex
CREATE INDEX "extractions_status_idx" ON "extractions"("status");
