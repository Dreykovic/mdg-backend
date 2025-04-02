import { MailClient, MailConfig, MailService } from '@/integrations/nodemailer';

// Créer une instance unique (Singleton) du client et du service de mail
export class MailModule {
  private static mailService: MailService;

  // Méthode statique pour initialiser le mail service
  public static init(config: MailConfig): MailService {
    if (!MailModule.mailService) {
      const mailClient = new MailClient(config);
      MailModule.mailService = new MailService(mailClient.getTransporter());
    }
    return MailModule.mailService;
  }

  // Méthode pour obtenir l'instance du service de mail
  public static getMailService(): MailService {
    if (!MailModule.mailService) {
      throw new Error(
        "MailService n'a pas été initialisé. Appelez MailModule.init() d'abord."
      );
    }
    return MailModule.mailService;
  }
}
