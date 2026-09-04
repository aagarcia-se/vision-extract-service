import { randomUUID } from 'node:crypto';
import { tursoClient } from './turso-client';
import { nowInAppTimezone } from '@shared/utils/timestamps';
import type { FacturaExtraction } from '@application/templates/factura/factura.schema';

export async function createFactura(clientId: string): Promise<string> {
  const id = randomUUID();
  const timestamp = nowInAppTimezone();

  await tursoClient.execute({
    sql: `INSERT INTO facturas (id, clientId, status, createdAt, updatedAt)
          VALUES (?, ?, 'PENDING', ?, ?)`,
    args: [id, clientId, timestamp, timestamp],
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
              nitReceptor = ?,
              nombreReceptor = ?,
              numeroFactura = ?,
              fecha = ?,
              hora = ?,
              total = ?,
              productos = ?,
              rawResult = ?,
              updatedAt = ?
          WHERE id = ?`,
    args: [
      providerName,
      mappedResult.nit,
      mappedResult.nombreEmisor,
      mappedResult.nitReceptor,
      mappedResult.nombreReceptor,
      mappedResult.numeroFactura,
      mappedResult.fecha,
      mappedResult.hora,
      mappedResult.total,
      JSON.stringify(mappedResult.productos),
      rawResult,
      nowInAppTimezone(),
      id,
    ],
  });
}

export async function markFacturaFailed(id: string, errorMessage: string): Promise<void> {
  await tursoClient.execute({
    sql: `UPDATE facturas
          SET status = 'FAILED', errorMessage = ?, updatedAt = ?
          WHERE id = ?`,
    args: [errorMessage, nowInAppTimezone(), id],
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
          VALUES (?, ?, ?, ?, ?)`,
    args: [id, facturaId, imagenBase64, mimeType, nowInAppTimezone()],
  });
}
