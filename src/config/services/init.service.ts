import DatabaseService from './database/database.service';
import MailingService from './mailing/mailing.service';
import ControllerService from './controller/controller.service';
import RepositoryService from './repos/repository.service';

/**
 * Application global initialization service.
 */
class InitService {
  private _dbService = <DatabaseService>{};
  private _emService = <MailingService>{};
  private _ctService = <ControllerService>{};
  private _rpService = <RepositoryService>{};

  get databaseService() {
    return this._dbService;
  }

  get emailingService() {
    return this._emService;
  }

  get controllerService() {
    return this._ctService;
  }

  get repositoryService() {
    return this._rpService;
  }

  /**
   * Start global initialization.
   */
  async start() {
    // init database service
    this._dbService = new DatabaseService(
      'DB_NAME_DYNAMIC',
      'DB_NAME_STATIC'
    );
    await this._dbService.setupDatabases();

    // init repository service
    this._rpService = new RepositoryService(
      this.databaseService
        .dynamicDatabaseService
        .dynamicModelService
        .models,
      this.databaseService
        .staticDatabaseService
        .staticModelService
        .models
    );

    // init controller service
    this._ctService = new ControllerService(
      this.repositoryService
        .dynamicRepositoryService
        .allRepositories,
      this.repositoryService
        .staticRepositoryService
        .allRepositories
    );

    // init emailing service
    this._emService = new MailingService();
  }
}

export const initService = new InitService();