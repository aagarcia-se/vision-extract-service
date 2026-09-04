export const FACTURA_EXTRACTION_PROMPT = `Esta imagen puede o no contener una factura de compra.

Lee el documento con cuidado, letra por letra y numero por numero. Presta especial
atencion a caracteres que se confunden facil en impresiones de baja calidad o tickets
termicos: 0 (cero) vs O (letra), 1 (uno) vs I (letra i mayuscula), 5 vs S, 8 vs B.

Retorna UNICAMENTE un JSON valido, sin texto adicional, sin markdown, sin backticks, con
este formato exacto:
{"esFactura":true,"nit":"...","nombreEmisor":"...","nitReceptor":"...","nombreReceptor":"...","numeroFactura":"...","fecha":"...","hora":"...","productos":[{"descripcion":"...","cantidad":0,"precioUnitario":0,"subtotal":0}],"total":0}

Reglas:
- esFactura debe ser true SOLO si la imagen efectivamente muestra una factura de compra
  real. Si la imagen es otra cosa (una foto no relacionada, un documento distinto, o esta
  tan borrosa/incompleta que no se puede reconocer como factura), pon esFactura en false
  y deja el resto de los campos en su valor por defecto: cadena vacia "" para textos,
  arreglo vacio [] para productos, y -1 para total. NO inventes datos de factura si la
  imagen no es una factura
- nit es el Numero de Identificacion Tributaria del negocio que EMITE la factura
- nombreEmisor es el nombre o razon social del negocio que EMITE la factura
- nitReceptor es el NIT de quien REALIZA LA COMPRA (el cliente/receptor), no el del emisor.
  Si en la factura aparece como consumidor final (puede estar escrito como "CF", "C/F",
  "c.f." u otra variante similar), usa exactamente el valor "CF"
- nombreReceptor es el nombre de quien REALIZA LA COMPRA. Si la factura indica consumidor
  final o no identifica a un comprador especifico, usa exactamente "CONSUMIDOR FINAL"
- numeroFactura es el numero o folio de la factura
- fecha: normaliza SIEMPRE al formato "YYYY-MM-DD" (año-mes-dia con guiones), sin importar
  el formato en que aparezca escrita en la factura. Ejemplos: "01/09/2026" -> "2026-09-01";
  "1-sep-2026" -> "2026-09-01"; "01-09-26" -> "2026-09-01"
- hora: normaliza SIEMPRE al formato de 24 horas "HH:MM:SS" (hora:minuto:segundo, con dos
  digitos cada uno). Toma la hora y los minutos tal como aparecen; si la factura NO trae
  segundos, complétalos con "00". Ejemplos: "2:32 PM" -> "14:32:00"; "14:32" -> "14:32:00";
  "9:05 AM" -> "09:05:00"
- productos es la lista de TODOS los productos o servicios facturados
- cantidad, precioUnitario y subtotal son valores numericos de cada producto
- total es el monto total de la factura
- Si un valor NUMERICO no se puede leer con claridad, usa -1
- Si fecha u hora no se pueden leer con claridad, usa cadena vacia "" (no inventes un valor)
- Para el resto de valores de TEXTO que no se puedan leer con claridad (y no aplique la
  regla de consumidor final), usa cadena vacia ""`;
