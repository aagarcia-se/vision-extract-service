import { z } from 'zod';

/**
 * Contrato de UN producto/servicio dentro de una factura.
 */
export const FacturaProductoSchema = z.object({
  descripcion: z.string().min(1, 'descripcion no puede estar vacia'),
  cantidad: z.number(),
  precioUnitario: z.number(),
  subtotal: z.number(),
});

/**
 * Contrato de la respuesta COMPLETA que el endpoint /extract/factura
 * debe devolver.
 *
 * IMPORTANTE: a diferencia de bakery, este contrato NO viene de un
 * sistema externo ya construido — es un diseño razonable a partir de lo
 * que se pidio (NIT, fecha, hora, productos, cantidades). Si el sistema
 * que va a consumir esto espera nombres de campo distintos, se ajusta
 * aqui sin tocar el resto del pipeline.
 *
 * Convencion de valores no legibles (igual que en bakery):
 * - Campos numericos: -1 si no se puede leer con claridad.
 * - Campos de texto: cadena vacia "" si no se puede leer con claridad.
 */
export const FacturaExtractionSchema = z.object({
  /**
   * El modelo se autoevalua: true si la imagen realmente parece una
   * factura de compra, false si no (otra foto, documento distinto,
   * demasiado ilegible para reconocerla como tal). Sirve como primera
   * señal de que la imagen no era del tipo esperado — el mapper la usa
   * para decidir si esto debe tratarse como un error, no como un
   * resultado exitoso con todo vacio.
   */
  esFactura: z.boolean(),

  /** Numero de Identificacion Tributaria del negocio que emite la factura. */
  nit: z.string(),

  /** Nombre o razon social del negocio que emite la factura. */
  nombreEmisor: z.string(),

  /**
   * NIT de quien realiza la compra (el receptor/cliente). Normalizado a
   * "CF" cuando la factura indica consumidor final (sin importar si en
   * la hoja aparece como "C/F", "c.f.", "CF", etc.).
   */
  nitReceptor: z.string(),

  /**
   * Nombre de quien realiza la compra. Normalizado a "CONSUMIDOR FINAL"
   * cuando la factura no identifica a un comprador especifico.
   */
  nombreReceptor: z.string(),

  /** Numero o folio de la factura. */
  numeroFactura: z.string(),

  /**
   * Fecha de emision, SIEMPRE normalizada a formato ISO "YYYY-MM-DD"
   * (independientemente de como venga escrita en la factura), para que
   * sea directamente ordenable/filtrable en consultas SQL. Cadena vacia
   * si no se pudo leer con claridad.
   */
  fecha: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$|^$/, 'fecha debe ser YYYY-MM-DD (o vacia si no es legible)'),

  /**
   * Hora de emision, SIEMPRE normalizada a formato 24 horas "HH:MM:SS"
   * (si la factura no trae segundos, se completa con "00"). Cadena vacia
   * si no se pudo leer con claridad.
   */
  hora: z
    .string()
    .regex(/^\d{2}:\d{2}:\d{2}$|^$/, 'hora debe ser HH:MM:SS (o vacia si no es legible)'),

  /** Todos los productos/servicios facturados. */
  productos: z.array(FacturaProductoSchema),

  /** Monto total de la factura. */
  total: z.number(),
});

export type FacturaProducto = z.infer<typeof FacturaProductoSchema>;
export type FacturaExtraction = z.infer<typeof FacturaExtractionSchema>;
