import path from 'node:path';
import multer from 'multer';

// Definido aqui (no en domain/errors) porque es un problema de la capa HTTP,
// no una regla de negocio: el archivo que llego no cumple lo que este
// endpoint acepta.
export class InvalidFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidFileError';
  }
}

// Limite de ENTRADA (antes de optimizeImage la comprima a <8MB para los
// proveedores de vision). Da margen para fotos grandes de celular.
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

const EXTENSION_TO_MIME_TYPE: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
};

const storage = multer.memoryStorage();

export const uploadImage = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype.startsWith('image/')) {
      callback(null, true);
      return;
    }

    // Algunos clientes (Postman incluido, en ciertos casos) no detectan
    // bien el mimetype y mandan "application/octet-stream" para una
    // imagen valida. Si la extension del archivo es una imagen conocida,
    // corregimos el mimetype aqui mismo, para que el resto del pipeline
    // (Gemini/Claude) reciba el valor correcto en vez de heredar el error.
    const extension = path.extname(file.originalname).toLowerCase();
    const correctedMimeType = EXTENSION_TO_MIME_TYPE[extension];

    if (!correctedMimeType) {
      callback(
        new InvalidFileError(
          `El archivo debe ser una imagen (recibido: ${file.mimetype}, nombre: ${file.originalname}).`,
        ),
      );
      return;
    }

    file.mimetype = correctedMimeType;
    callback(null, true);
  },
}).single('image');
