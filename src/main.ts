import { createServer } from './server';
import { env } from '@infrastructure/config/env';
import { logger } from '@infrastructure/logger/logger';

const app = createServer();

app.listen(env.PORT, () => {
  logger.info(`Server running on http://localhost:${env.PORT}`);
});
