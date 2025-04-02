export interface MailConfig {
  service: 'smtp' | 'oauth';
  host?: string;
  port?: number;
  user: string;
  pass: string;
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
}

export interface MailOptions {
  from?: string;
  to: string;
  subject: string;
  templateName: string;
  templateData: any;
}

export interface MailServiceInterface {
  sendMail(options: MailOptions): Promise<void>;
}
