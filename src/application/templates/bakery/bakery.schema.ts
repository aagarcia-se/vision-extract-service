import { z } from 'zod';

/**
 * Contrato de UN producto dentro de la hoja de "Control de Sobrantes".
 *
 * Este schema valida en runtime la forma exacta que el sistema consumidor
 * espera recibir para cada fila de las tablas (Codigo, Nombre Producto, Sobrante).
 */
export const BakeryProductSchema = z.object({
  /**
   * Codigo del producto, tal como lo definiste: valor numerico de la
   * columna Codigo.
   */
  idProducto: z.number({ message: 'idProducto debe ser un numero' }),

  nombreProducto: z.string().min(1, 'nombreProducto no puede estar vacio'),

  /**
   * Cantidad de sobrante leida de la hoja.
   *
   * IMPORTANTE: -1 NO es un valor de negocio real. Es un codigo de error
   * definido por el propio contrato: significa "el valor no se pudo leer
   * claramente en la imagen". El rango de negocio valido es >= 0; -1 es
   * una senal explicita de fallo de lectura que el caso de uso debera
   * interpretar mas adelante (por ejemplo, marcar la extraccion para
   * revision manual).
   */
  Sobrantes: z.number().int('Sobrantes debe ser un numero entero'),
});

/**
 * Contrato de la respuesta COMPLETA que el endpoint HTTP debe devolver.
 * Es, literalmente, el JSON final: sin envolver con metadata adicional.
 */
export const BakeryExtractionSchema = z.object({
  detalleVenta: z.array(BakeryProductSchema),
});

// Tipos de TypeScript inferidos directamente de los schemas de arriba.
// Nunca se escriben a mano: si el schema cambia, el tipo cambia solo.
export type BakeryProduct = z.infer<typeof BakeryProductSchema>;
export type BakeryExtraction = z.infer<typeof BakeryExtractionSchema>;
