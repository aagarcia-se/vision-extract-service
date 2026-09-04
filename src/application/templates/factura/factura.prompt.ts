export const FACTURA_EXTRACTION_PROMPT = `Esta imagen contiene una factura de compra.

Extrae la siguiente informacion y retorna UNICAMENTE un JSON valido, sin texto
adicional, sin markdown, sin backticks, con este formato exacto:
{"nit":"...","nombreEmisor":"...","nitReceptor":"...","nombreReceptor":"...","numeroFactura":"...","fecha":"...","hora":"...","productos":[{"descripcion":"...","cantidad":0,"precioUnitario":0,"subtotal":0}],"total":0}

Reglas:
- nit es el Numero de Identificacion Tributaria del negocio que EMITE la factura
- nombreEmisor es el nombre o razon social del negocio que EMITE la factura
- nitReceptor es el NIT de quien REALIZA LA COMPRA (el cliente/receptor), no el del emisor.
  Si en la factura aparece como consumidor final (puede estar escrito como "CF", "C/F",
  "c.f." u otra variante similar), usa exactamente el valor "CF"
- nombreReceptor es el nombre de quien REALIZA LA COMPRA. Si la factura indica consumidor
  final o no identifica a un comprador especifico, usa exactamente "CONSUMIDOR FINAL"
- numeroFactura es el numero o folio de la factura
- fecha es la fecha de emision, tal como aparece en la factura
- hora es la hora de emision, tal como aparece en la factura
- productos es la lista de TODOS los productos o servicios facturados
- cantidad, precioUnitario y subtotal son valores numericos de cada producto
- total es el monto total de la factura
- Si un valor NUMERICO no se puede leer con claridad, usa -1
- Si un valor de TEXTO no se puede leer con claridad (y no aplica la regla de consumidor
  final), usa cadena vacia ""`;
