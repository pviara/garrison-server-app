import LoggerService from './logger/logger.service';

import databaseService from './database/database.service';
import mailingService from './mailing/mailing.service';

/**
 * Application global initialization service.
 */
class InitService {
  private _logger = new LoggerService(this.constructor.name);

  private _dbService = databaseService;
  private _emService = mailingService;

  /**
   * Start global initialization.
   */
  async start() {
    await this._dbService.connectDatabases();
    this._emService.configureTransport();
  }
}

export = new InitService();