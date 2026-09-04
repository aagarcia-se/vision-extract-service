-- Ejecuta esto en el editor SQL de Turso (o con turso db shell).

-- ============================================================
-- Tabla: extractions (template "bakery")
-- ============================================================

DROP TABLE IF EXISTS extractions;

CREATE TABLE extractions (
  id            TEXT PRIMARY KEY,
  clientId      TEXT NOT NULL,
  templateUsed  TEXT NOT NULL,
  provider      TEXT,                           -- 'gemini' o 'claude'; NULL hasta que se sepa cual respondio
  status        TEXT NOT NULL DEFAULT 'PENDING', -- PENDING | COMPLETED | FAILED
  rawResult     TEXT,                            -- texto crudo devuelto por el proveedor
  mappedResult  TEXT,                            -- JSON ya validado (guardado como texto)
  errorMessage  TEXT,
  createdAt     TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_extractions_clientId ON extractions(clientId);
CREATE INDEX idx_extractions_status ON extractions(status);


-- ============================================================
-- Tabla: facturas (template "factura") — datos estructurados
-- ============================================================

DROP TABLE IF EXISTS facturas;

CREATE TABLE facturas (
  id             TEXT PRIMARY KEY,
  clientId       TEXT NOT NULL,
  provider       TEXT,                           -- 'gemini' o 'claude'
  nit            TEXT,                            -- NIT del EMISOR
  nombreEmisor   TEXT,                            -- Nombre/razon social del EMISOR
  nitReceptor    TEXT,                            -- NIT de quien compra ('CF' si es consumidor final)
  nombreReceptor TEXT,                            -- Nombre de quien compra ('CONSUMIDOR FINAL' si aplica)
  numeroFactura  TEXT,
  fecha          TEXT,
  hora           TEXT,
  total          REAL,
  productos      TEXT,                           -- JSON array de productos, guardado como texto
  status         TEXT NOT NULL DEFAULT 'PENDING', -- PENDING | COMPLETED | FAILED
  rawResult      TEXT,                            -- texto crudo devuelto por el proveedor
  errorMessage   TEXT,
  createdAt      TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_facturas_clientId ON facturas(clientId);
CREATE INDEX idx_facturas_status ON facturas(status);
CREATE INDEX idx_facturas_nit ON facturas(nit);
CREATE INDEX idx_facturas_nitReceptor ON facturas(nitReceptor);


-- ============================================================
-- Tabla: facturas_imagenes — el base64 de cada factura, aparte
-- ============================================================

DROP TABLE IF EXISTS facturas_imagenes;

CREATE TABLE facturas_imagenes (
  id            TEXT PRIMARY KEY,
  facturaId     TEXT NOT NULL,
  imagenBase64  TEXT NOT NULL,
  mimeType      TEXT NOT NULL,
  createdAt     TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (facturaId) REFERENCES facturas(id)
);

CREATE INDEX idx_facturas_imagenes_facturaId ON facturas_imagenes(facturaId);


-- ============================================================
-- Si prefieres conservar datos existentes en vez de recrear todo,
-- usa esto en lugar de los DROP+CREATE de "extractions" y "facturas":
-- ============================================================
-- ALTER TABLE extractions ADD COLUMN provider TEXT;
-- ALTER TABLE facturas ADD COLUMN nitReceptor TEXT;
-- ALTER TABLE facturas ADD COLUMN nombreReceptor TEXT;
