import { randomUUID } from 'node:crypto';
import { tursoClient } from './turso-client';
import { nowInAppTimezone } from '@shared/utils/timestamps';

/**
 * SQL explicito para cada operacion sobre la tabla "extractions". No hay
 * capa de ORM entre esto y la base de datos — lo que se ve aqui es
 * literalmente lo que se ejecuta.
 *
 * No es un "repositorio" en el sentido formal de un puerto/adapter (no
 * hay una interfaz IExtractionRepository) — son funciones simples que el
 * caso de uso llama directo. Con un solo modelo y dos operaciones,
 * formalizar mas que esto seria indireccion sin beneficio real.
 */

export async function createExtraction(clientId: string, templateUsed: string): Promise<string> {
  const id = randomUUID();
  const timestamp = nowInAppTimezone();

  await tursoClient.execute({
    sql: `INSERT INTO extractions (id, clientId, templateUsed, status, createdAt, updatedAt)
          VALUES (?, ?, ?, 'PENDING', ?, ?)`,
    args: [id, clientId, templateUsed, timestamp, timestamp],
  });

  return id;
}

export async function markExtractionCompleted(
  id: string,
  providerName: string,
  rawResult: string,
  mappedResult: unknown,
): Promise<void> {
  await tursoClient.execute({
    sql: `UPDATE extractions
          SET status = 'COMPLETED', provider = ?, rawResult = ?, mappedResult = ?, updatedAt = ?
          WHERE id = ?`,
    args: [providerName, rawResult, JSON.stringify(mappedResult), nowInAppTimezone(), id],
  });
}

export async function markExtractionFailed(id: string, errorMessage: string): Promise<void> {
  await tursoClient.execute({
    sql: `UPDATE extractions
          SET status = 'FAILED', errorMessage = ?, updatedAt = ?
          WHERE id = ?`,
    args: [errorMessage, nowInAppTimezone(), id],
  });
}
