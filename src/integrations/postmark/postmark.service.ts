import { Transporter } from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import { MailOptions, MailServiceInterface } from './postmark.types';
import logger from '@/core/utils/logger.util';

export class MailService implements MailServiceInterface {
  private readonly transporter: Transporter;

  constructor(transporter: Transporter) {
    this.transporter = transporter;
  }

  async sendMail(options: MailOptions): Promise<void> {
    try {
      // Résolution du chemin du template EJS
      const templatePath = path.join(
        __dirname,
        '..',
        'templates',
        `${options.templateName}.ejs`
      );

      // Rendre le template EJS avec les données
      const html = (await ejs.renderFile(
        templatePath,
        options.templateData
      )) as string;

      const mailOptions = {
        from: options.from ?? '"Your Name" <your-email@example.com>',
        to: options.to,
        subject: options.subject,
        html, // Le contenu HTML est maintenant typé en `string`
      };

      await this.transporter.sendMail(mailOptions);
      logger.debug('Email envoyé avec succès.');
    } catch (error) {
      logger.debug("Erreur lors de l'envoi de l'email :", error);
    }
  }
}
