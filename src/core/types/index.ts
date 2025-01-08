export type UserLogin = {
  username: string;
  password: string;
};

export type AccessTokenPayload = {
  userId: string;
  profiles: string;
  username: string;
  email: string;
};

export type RefreshTokenPayload = {
  userId: string;
  profiles: string;
};
export type ClientInfo = {
  ipAddress: string; // Adresse IP du client
  userAgent: string; // User-Agent de la requête
  acceptLang: string; // Langue acceptée par le client
  deviceType: string; // Type d'appareil
  deviceBrand: string; // Marque de l'appareil (Samsung, Apple, etc.)
  deviceModel: string; // Modèle de l'appareil (Galaxy S21, iPhone 12, etc.)
  osName: string; // Nom du système d'exploitation (Android, iOS, Windows, etc.)
  osVersion: string; // Version du système d'exploitation (par ex: 10, 11, etc.)
  clientName: string; // Nom du client (navigateur ou application)
  clientType: string; // Type de client (navigateur, application mobile, etc.)
  clientVersion: string; // Version du client (par exemple, version du navigateur)
};
