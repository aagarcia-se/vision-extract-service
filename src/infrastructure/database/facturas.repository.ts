import { randomUUID } from 'node:crypto';
import { tursoClient } from './turso-client';
import type { FacturaExtraction } from '@application/templates/factura/factura.schema';

export async function createFactura(clientId: string): Promise<string> {
  const id = randomUUID();

  await tursoClient.execute({
    sql: `INSERT INTO facturas (id, clientId, status, createdAt, updatedAt)
          VALUES (?, ?, 'PENDING', datetime('now'), datetime('now'))`,
    args: [id, clientId],
  });

  return id;
}

export async function markFacturaCompleted(
  id: string,
  providerName: string,
  rawResult: string,
  mappedResult: FacturaExtraction,
): Promise<void> {
  await tursoClient.execute({
    sql: `UPDATE facturas
          SET status = 'COMPLETED',
              provider = ?,
              nit = ?,
              nombreEmisor = ?,
              numeroFactura = ?,
              fecha = ?,
              hora = ?,
              total = ?,
              productos = ?,
              rawResult = ?,
              updatedAt = datetime('now')
          WHERE id = ?`,
    args: [
      providerName,
      mappedResult.nit,
      mappedResult.nombreEmisor,
      mappedResult.numeroFactura,
      mappedResult.fecha,
      mappedResult.hora,
      mappedResult.total,
      JSON.stringify(mappedResult.productos),
      rawResult,
      id,
    ],
  });
}

export async function markFacturaFailed(id: string, errorMessage: string): Promise<void> {
  await tursoClient.execute({
    sql: `UPDATE facturas
          SET status = 'FAILED', errorMessage = ?, updatedAt = datetime('now')
          WHERE id = ?`,
    args: [errorMessage, id],
  });
}

/**
 * Guarda el base64 de la imagen ORIGINAL de la factura, en una tabla
 * separada de "facturas" (no mezclar datos estructurados con el blob de
 * la imagen en la misma tabla — evita que cada SELECT normal de facturas
 * arrastre el base64 completo).
 */
export async function saveFacturaImage(
  facturaId: string,
  imagenBase64: string,
  mimeType: string,
): Promise<void> {
  const id = randomUUID();

  await tursoClient.execute({
    sql: `INSERT INTO facturas_imagenes (id, facturaId, imagenBase64, mimeType, createdAt)
          VALUES (?, ?, ?, ?, datetime('now'))`,
    args: [id, facturaId, imagenBase64, mimeType],
  });
}
