export const FACTURA_EXTRACTION_PROMPT = `Esta imagen puede o no ser una factura de compra. Leela con cuidado; en impresiones o
tickets termicos de baja calidad no confundas 0/O, 1/I, 5/S, 8/B.

Retorna UNICAMENTE este JSON (sin texto adicional, sin markdown, sin backticks). SIEMPRE
devuelve el JSON completo con esta forma exacta, nunca agregues una explicacion en texto
en su lugar, incluso si la imagen esta incompleta o cortada:
{"esFactura":true,"nit":"...","nombreEmisor":"...","nitReceptor":"...","nombreReceptor":"...","numeroFactura":"...","fecha":"...","hora":"...","productos":[{"descripcion":"...","cantidad":0,"precioUnitario":0,"subtotal":0}],"total":0}

Convencion para valores no legibles: texto -> "" | numero -> -1. No inventes datos.

Campos:
- esFactura: true SOLO si realmente es una factura de compra. Si no (otra foto, documento
  distinto, o demasiado ilegible), pon false y deja el resto en su valor por defecto.
  IMPORTANTE — factura cortada/incompleta: si la imagen esta recortada y NO se ven los
  datos del negocio que emite (nit, nombreEmisor) o el numeroFactura, pero SI se alcanzan
  a leer los datos de la COMPRA (productos y/o total) Y los datos del RECEPTOR
  (nitReceptor/nombreReceptor), esFactura sigue siendo true. Deja unicamente vacios los
  campos que realmente no se ven (nit, nombreEmisor, numeroFactura, fecha, hora) — los
  datos de compra y receptor son los que importan en ese caso
- nit / nombreEmisor: NIT y nombre del negocio que EMITE la factura
- nitReceptor / nombreReceptor: NIT y nombre de quien COMPRA (no el emisor). Si es
  consumidor final (CF, C/F, c.f., u otra variante), usa "CF" y "CONSUMIDOR FINAL"
- numeroFactura: numero o folio de la factura
- fecha: normaliza SIEMPRE a "YYYY-MM-DD" sin importar el formato original
  (ej: "01/09/2026" -> "2026-09-01")
- hora: normaliza SIEMPRE a 24h "HH:MM:SS"; si no trae segundos usa "00"
  (ej: "2:32 PM" -> "14:32:00")
- productos: TODOS los productos/servicios facturados, con cantidad, precioUnitario y
  subtotal numericos
- total: monto total de la factura`;
