const APP_TIMEZONE = 'America/Guatemala';

/**
 * Devuelve la fecha/hora actual en la zona horaria de la aplicacion,
 * en formato "YYYY-MM-DD HH:MM:SS" — compatible con las columnas TEXT
 * que usa SQLite/Turso para timestamps.
 *
 * Se calcula aqui (en vez de usar datetime('now') de SQLite, que siempre
 * devuelve UTC) para no depender de un offset fijo repetido en cada
 * archivo SQL — si el negocio alguna vez opera en otra zona horaria,
 * se ajusta en este unico lugar.
 *
 * El truco del locale "sv-SE" (sueco) es intencional: es de los pocos
 * locales de Intl que formatean fecha/hora en un orden compatible con
 * "YYYY-MM-DD HH:MM:SS" de forma nativa, sin tener que reordenar el
 * string a mano.
 */
export function nowInAppTimezone(): string {
  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return formatter.format(new Date());
}
