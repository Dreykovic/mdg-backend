import morgan from 'morgan';
import logger from '@/core/utils/logger.util';
import config from '@/config';
import fs from 'fs';
import path from 'path';
import cluster from 'cluster';

const logDir = path.resolve('logs');

// Assure-toi que le dossier logs existe
void (async (): Promise<void> => {
  try {
    await fs.promises.mkdir(logDir, { recursive: true });
  } catch (err) {
    logger.error('Erreur lors de la création du dossier de logs:', err);
  }
})();

const workerId = cluster.isPrimary ? 'master' : `worker-${process.pid}`;
const logFilePath = path.join(logDir, `${workerId}-access.log`);

// Test d'écriture dans le fichier
fs.promises.appendFile(logFilePath, '[INIT] Logger démarré\n').catch((err) => {
  logger.error('Erreur d’écriture dans le fichier de log:', err);
});

const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

const logFormat = config.isDev ? 'dev' : 'combined';

// Middleware Morgan
const httpLogger = morgan(logFormat, {
  stream: {
    write: (message: string) => {
      try {
        logStream.write(message);
        logger.info(`[${workerId}] ${message.trim()}`);
      } catch (err) {
        logger.error('Erreur lors de l’écriture des logs:', err);
      }
    },
  },
  skip: () => false,
});

export default httpLogger;
