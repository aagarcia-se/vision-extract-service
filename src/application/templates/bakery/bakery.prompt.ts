export const BAKERY_CONTROL_SOBRANTES_PROMPT = `Esta imagen contiene una hoja de "Control de Sobrantes" con DOS tablas lado a lado.
Cada tabla tiene 3 columnas: Codigo, Nombre Producto y Sobrante.
Los valores en la columna Sobrante pueden estar escritos a mano con lapicero.

Extrae TODOS los productos de AMBAS tablas y retorna UNICAMENTE un JSON valido
con el siguiente formato, sin texto adicional, sin markdown, sin backticks:
{"detalleVenta":[{"idProducto":0,"nombreProducto":"...","Sobrantes":0}]}

Reglas:
- idProducto es el valor de la columna Codigo (numero)
- nombreProducto es el valor de la columna Nombre Producto
- Sobrantes es el valor numerico de la columna Sobrante
- Si Sobrante es 0 o esta vacio, se incluye el producto con sobrantes igual a 0
- Si un valor no se puede leer claramente, usa -1`;
