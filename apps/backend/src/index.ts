import app from './app';
import { config } from './config/env';
import { logger } from './config/logger';

app.listen(config.port, () => {
  logger.info(`Serveur démarré sur le port ${config.port}`);
});
