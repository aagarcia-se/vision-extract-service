import 'dotenv/config';
import util from 'node:util';
import { prisma } from './src/infrastructure/database/prisma-client';

async function main() {
  const result = await prisma.extraction.create({
    data: {
      clientId: 'bakery',
      templateUsed: 'bakery',
      status: 'PENDING',
    },
  });
  console.log('OK:', result);
}

main()
  .catch((error) => {
    console.error('FALLO:');
    console.error(util.inspect(error, { depth: null, colors: false }));
  })
  .finally(() => process.exit());