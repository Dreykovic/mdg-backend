import pino from 'pino';
import { resolve } from 'path';
import appRoot from 'app-root-path';
import fs from 'fs';
import cluster from 'cluster';
import config from '@/config';
console.log('Config loaded:', typeof config !== 'undefined' && config !== null);
console.log(
  'Config keys:',
  config !== undefined && config !== null ? Object.keys(config) : 'undefined'
);
// Type for environment
type Environment = 'development' | 'test' | 'production';

// Create logs directory if it doesn't exist (async version)
const logsDir = resolve(appRoot.path, 'logs');
void (async (): Promise<void> => {
  try {
    await fs.promises.access(logsDir, fs.constants.F_OK);
  } catch {
    await fs.promises.mkdir(logsDir, { recursive: true });
  }
})();

// Determine log level based on environment
const logLevel = config.isProd ? 'info' : 'debug';

// Determine current environment safely
const currentEnv = (config.nodeEnv || 'development') as Environment;

// Configure base logger options
const loggerOptions: pino.LoggerOptions = {
  level: logLevel,
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    pid: process.pid,
    workerId: cluster.isWorker ? cluster.worker?.id : 'master',
  },
  redact: {
    paths: ['password', 'secret', 'authorization', '*.password', '*.secret'],
    censor: '[REDACTED]',
  },
};

// Function to create logger instance
const createLogger = (): pino.Logger => {
  if (cluster.isWorker) {
    const workerId = cluster.worker?.id ?? 'unknown';
    return pino(
      {
        ...loggerOptions,
        base: { ...loggerOptions.base, workerId },
      },
      pino.destination(resolve(logsDir, `worker-${workerId}.log`))
    );
  }

  if (currentEnv === 'development' && !config.isTest) {
    const transport = pino.transport({
      targets: [
        {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
            ignore: 'pid,hostname,workerId',
          },
          level: logLevel,
        },
        {
          target: 'pino/file',
          level: logLevel,
          options: { destination: resolve(logsDir, 'application.log') },
        },
        {
          target: 'pino/file',
          level: 'error',
          options: { destination: resolve(logsDir, 'error.log') },
        },
      ],
    });

    return pino(loggerOptions, transport);
  }

  if (config.isTest) {
    return pino({ ...loggerOptions, level: 'silent' });
  }

  const streams = [
    { stream: process.stdout },
    {
      stream: pino.destination({
        dest: resolve(logsDir, 'application.log'),
        sync: false,
      }),
    },
    {
      level: 'error',
      stream: pino.destination({
        dest: resolve(logsDir, 'error.log'),
        sync: true,
      }),
    },
  ];

  return pino(loggerOptions, pino.multistream(streams));
};

const logger = createLogger();

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception');
  void fs.promises.appendFile(
    resolve(logsDir, 'exceptions.log'),
    `${new Date().toISOString()} FATAL: Uncaught exception: ${err.message}\n${err.stack}\n`
  );
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'Unhandled rejection at Promise');
});

export default logger;
