import sharp from 'sharp';

const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB

/**
 * Redimensiona/comprime una imagen hasta que quede por debajo del limite
 * de tamano que aceptan los proveedores de vision. Si ya cumple, la
 * devuelve sin tocar.
 *
 * Funcion pura de infraestructura tecnica (no de negocio): por eso vive
 * en shared/utils y no depende de nada de application/domain.
 */
export async function optimizeImage(buffer: Buffer): Promise<Buffer> {
  if (buffer.length <= MAX_SIZE_BYTES) {
    return buffer;
  }

  const metadata = await sharp(buffer).metadata();
  let width = metadata.width;
  let quality = 90;
  let output = buffer;

  while (output.length > MAX_SIZE_BYTES) {
    output = await sharp(buffer)
      .resize(width ? { width, withoutEnlargement: true } : undefined)
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();

    if (output.length <= MAX_SIZE_BYTES) {
      break;
    }

    if (quality > 30) {
      quality -= 10;
      continue;
    }

    if (!width) {
      throw new Error('No fue posible determinar el ancho de la imagen para reducirla.');
    }

    width = Math.floor(width * 0.8);

    if (width < 500) {
      throw new Error(
        `No fue posible reducir la imagen por debajo de 8 MB. Tamano actual: ${(
          output.length /
          1024 /
          1024
        ).toFixed(2)} MB`,
      );
    }
  }

  return output;
}
