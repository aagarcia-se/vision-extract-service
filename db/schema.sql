-- Ejecuta esto en el editor SQL de Turso (o con turso db shell).
--
-- Si ya tenias la tabla creada desde la version con Prisma, bórrala primero
-- (estamos en fase de pruebas, no hay datos reales todavia que preservar):

DROP TABLE IF EXISTS extractions;

CREATE TABLE extractions (
  id            TEXT PRIMARY KEY,
  clientId      TEXT NOT NULL,
  templateUsed  TEXT NOT NULL,
  provider      TEXT,                          -- 'gemini' o 'claude'; NULL hasta que se sepa cual respondio
  status        TEXT NOT NULL DEFAULT 'PENDING',-- PENDING | COMPLETED | FAILED
  rawResult     TEXT,                           -- texto crudo devuelto por el proveedor
  mappedResult  TEXT,                           -- JSON ya validado (guardado como texto)
  errorMessage  TEXT,
  createdAt     TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_extractions_clientId ON extractions(clientId);
CREATE INDEX idx_extractions_status ON extractions(status);

-- Si en vez de borrar prefieres conservar los datos de prueba que ya
-- tengas, usa esto en su lugar del DROP+CREATE de arriba:
-- ALTER TABLE extractions ADD COLUMN provider TEXT;
