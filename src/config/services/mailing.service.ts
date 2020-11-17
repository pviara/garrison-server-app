import mjml2html from 'mjml';
import { createTransport } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

import { ELogType as logType } from '../../config/models/log/log.model';
import LoggerService from '../../config/services/logger.service';

/**
 * Application global mailing service.
 */
class MailingService {
  private _transport = <Mail>{};
  private _hasBeenConfigured = false;

  private _logger = new LoggerService(this.constructor.name);

  /**
   * Configure the current mailing service.
   */
  configureTransport() {
    if (this._hasBeenConfigured) return;
    try {
      this._logger.log(logType.pending, 'Configuring mailing service...');
      if (!process.env.SMTP_USER_EMAIL || !process.env.SMTP_USER_PASSWORD)
        throw new Error('Couldn\'t retrieve either SMTP user or password from .env file.');

      this._transport = createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.SMTP_USER_EMAIL,
          pass: process.env.SMTP_USER_PASSWORD
        }
      });
      this._hasBeenConfigured = true;
      this._logger.log(logType.pass, 'Configured mailing service');
    } catch (err) {
      this._logger.log(logType.fail, 'Failed to configure mailing service');
      throw err;
    }
  }

  /**
   * Send an e-mail to the given receiver, and with the given subject and content.
   * @param to E-mail receiver.
   * @param subject E-mail subject.
   * @param html E-mail content.
   */
  async send(to: string, subject: string, html: string) {
    await this._transport.sendMail({
      from: `Garrison <${process.env.SMTP_USER_EMAIL}>`,
      to,
      subject,
      html
    });
  }
}

export = new MailingService();