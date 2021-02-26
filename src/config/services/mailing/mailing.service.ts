import { ELogType as logType } from '../../models/log/log.model';
import IMonitored from '../../models/IMonitored';
import MonitoringService from '../monitoring/monitoring.service'

import { createTransport } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

/**
 * Application global mailing service.
 */
export default class MailingService implements IMonitored {
  private _transport = <Mail>{};
  private _hasBeenConfigured = false;

  private _monitor = new MonitoringService(this.constructor.name);

  /** Retrieve class monitoring service. */
  get monitor() {
    return this._monitor;
  }

  constructor() {
    this._configureTransport();
  }

  /**
   * Configure the current mailing service.
   */
  private _configureTransport() {
    if (this._hasBeenConfigured) return;
    try {
      this._monitor.log(logType.pending, 'Configuring mailing service...');
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
      this._monitor.log(logType.pass, 'Configured mailing service');
    } catch (err) {
      this._monitor.log(logType.fail, 'Failed to configure mailing service');
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