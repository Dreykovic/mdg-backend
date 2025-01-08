import { env, nodeEnv } from './env.config';

const mailConfig = {
  nodeEnv,
  isTest: nodeEnv === 'test',
  isDev: nodeEnv === 'development',
  isStage: nodeEnv === 'staging',
  isProd: nodeEnv === 'production',
  auth: {
    type: 'OAuth2',
  },
  smtp: {
    service: env.EMAIL_SMTP_SERVICE ?? 'gmail',
    user: env.EMAIL_SMTP_USER ?? 'admin',
    password: env.EMAIL_SMTP_PASSWORD ?? '',
  },
  oauth: {
    clientId: env.EMAIL_OAUTH_CLIENT_ID ?? '',
    clientSecret: env.EMAIL_OAUTH_CLIENT_SECRET ?? '',
    refreshToken: env.EMAIL_OAUTH_REFRESH_TOKEN ?? '',
    redirect: env.EMAIL_OAUTH_REDIRECT ?? '',
  },
  debug: {
    debug: true,
    logger: true,
  },
};

export default mailConfig;
