import { ProfileName } from '@prisma/client';

// Type pour les configurations SSL
export interface SSLConfig {
  isHttps: boolean;
  privateKey: string;
  certificate: string;
  ca?: string;
  ciphers?: string;
  secureProtocol?: string;
  dhparam?: string;
  preferServerCiphers?: boolean;
  sessionTimeout?: number;
}

// Type pour les configurations API
export interface ApiConfig {
  prefix: string;
  version?: string;
  jsonLimit: string;
  extUrlencoded: boolean;
}

// Type pour les configurations CORS
export interface CorsConfig {
  allowOrigins: string[];
  credentials?: boolean;
  methods?: string[];
  maxAge?: number;
}

// Type pour les configurations JWT
export interface JwtConfig {
  secretUser: string;
  secretAdmin: string;
  secretApp: string;
  expiredIn: string;
  refreshToken: string;
  refreshExpiresIn: string;
  accessToken: string;
  mobileExpiredIn: string;
  maxConnexions: number;
  algorithm?: string;
}

// Type pour les configurations OTP
export interface OtpConfig {
  expiredIn: string;
  hashSecret: string;
}

// Type pour les configurations de chiffrement
export interface CryptoConfig {
  cryptoSecretKey: string;
}

// Type pour les configurations pays
export interface CountryConfig {
  flagUrlBase: string;
}

// Type pour les configurations mot de passe
export interface PwdConfig {
  pwdLength: number;
}

// Type pour les configurations bcrypt
export interface BcryptConfig {
  saltRounds: number;
}

// Type pour les configurations rate limiter
export interface RateLimiterConfig {
  max: string;
  window: string;
  skipSuccessfulRequests?: boolean;
  trustProxy?: boolean;
}

// Type pour les configurations de débogage
export interface DebugConfig {
  http_request: boolean;
  http_connection: boolean;
  monitor_interval?: number;
}

// Type pour les configurations utilisateur par défaut
export interface DefaultUserConfig {
  name: string;
  contact: string;
  password: string;
  email: string;
  profiles: ProfileName;
}

// Type pour les configurations de l'application
export interface AppConfig {
  host: string;
  port: number;
}

// Type pour les configurations de la base de données
export interface DatabaseConfig {
  connectionPoolSize: number;
  connectionTimeout: number;
  queryTimeout: number;
}

// Type pour les configurations du serveur mail
export interface MailConfig {
  enabled: boolean;
  service?: string;
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  pass?: string;
}

// Type pour la configuration complète de l'environnement
export interface EnvConfig {
  nodeEnv: string;
  isTest: boolean;
  isDev: boolean;
  isStage: boolean;
  isProd: boolean;
  country: CountryConfig;
  crypto: CryptoConfig;
  app: AppConfig;
  pwd: PwdConfig;
  ssl: SSLConfig;
  api: ApiConfig;
  cors: CorsConfig;
  jwt: JwtConfig;
  otp: OtpConfig;
  bcrypt: BcryptConfig;
  rateLimiter: RateLimiterConfig;
  debug: DebugConfig;
  defaultUser: DefaultUserConfig;

  // Nouvelles configurations
  cluster: boolean;
  clusterWorkers: number;
  keepAliveTimeout: number;
  headerTimeout: number;
  maxRequestSize: string;
  trustProxy: boolean;
  database: DatabaseConfig;
  mail: MailConfig;
}
