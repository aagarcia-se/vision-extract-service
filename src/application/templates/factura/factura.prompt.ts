export const FACTURA_EXTRACTION_PROMPT = `Esta imagen contiene una factura de compra.

Extrae la siguiente informacion y retorna UNICAMENTE un JSON valido, sin texto
adicional, sin markdown, sin backticks, con este formato exacto:
{"nit":"...","nombreEmisor":"...","numeroFactura":"...","fecha":"...","hora":"...","productos":[{"descripcion":"...","cantidad":0,"precioUnitario":0,"subtotal":0}],"total":0}

Reglas:
- nit es el Numero de Identificacion Tributaria del negocio que emite la factura
- nombreEmisor es el nombre o razon social del negocio que emite la factura
- numeroFactura es el numero o folio de la factura
- fecha es la fecha de emision, tal como aparece en la factura
- hora es la hora de emision, tal como aparece en la factura
- productos es la lista de TODOS los productos o servicios facturados
- cantidad, precioUnitario y subtotal son valores numericos de cada producto
- total es el monto total de la factura
- Si un valor NUMERICO no se puede leer con claridad, usa -1
- Si un valor de TEXTO no se puede leer con claridad, usa cadena vacia ""`;
