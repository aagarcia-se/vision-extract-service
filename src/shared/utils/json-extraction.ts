/**
 * Los modelos generativos a veces envuelven su respuesta en un bloque de
 * markdown (```json ... ``` o ``` ... ```) aunque el prompt pida
 * explicitamente lo contrario — es un habito de entrenamiento que ninguna
 * redaccion del prompt garantiza evitar al 100%. Por eso se limpia aqui,
 * de forma defensiva, en vez de confiar unicamente en la instruccion.
 *
 * Si el texto no tiene un bloque de markdown, se devuelve tal cual
 * (recortando solo espacios en blanco).
 */
export function stripMarkdownCodeFence(text: string): string {
  const trimmed = text.trim();
  const codeFenceMatch = /^```(?:json)?\s*\n([\s\S]*?)\n?```$/i.exec(trimmed);

  return codeFenceMatch ? codeFenceMatch[1].trim() : trimmed;
}
