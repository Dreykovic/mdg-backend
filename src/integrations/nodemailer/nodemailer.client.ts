import nodemailer, { Transporter } from 'nodemailer';
import { MailConfig } from './nodemailer.types';

export class MailClient {
  private transporter: Transporter;

  constructor(config: MailConfig) {
    this.transporter = this.createTransporter(config);
  }

  private createTransporter(config: MailConfig): Transporter {
    if (config.service === 'smtp') {
      return nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.port === 465,
        auth: {
          user: config.user,
          pass: config.pass,
        },
      });
    } else if (config.service === 'oauth') {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: config.user,
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          refreshToken: config.refreshToken,
        },
      });
    } else {
      throw new Error('Service de mail inconnu.');
    }
  }

  public getTransporter(): Transporter {
    return this.transporter;
  }
}
