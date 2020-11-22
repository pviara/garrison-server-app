import DatabaseService from './database/database.service';
import MailingService from './mailing/mailing.service';
import ControllerService from './controller/controller.service';

/**
 * Application global initialization service.
 */
class InitService {
  private _dbService = <DatabaseService>{};
  private _emService = <MailingService>{};
  private _ctService = <ControllerService>{};

  get dbService() {
    return this._dbService;
  }

  get emService() {
    return this._emService;
  }

  get ctService() {
    return this._ctService;
  }

  /**
   * Start global initialization.
   */
  async start() {
    // init db service
    this._dbService = new DatabaseService();
    await this._dbService.connectDatabases();

    // init mailing system
    this._emService = new MailingService();
    this._emService.configureTransport();

    this._ctService = new ControllerService(this._dbService);
    this._ctService.configureControllers();
  }
}

export const initService = new InitService();