import ErrorHandler from '../../models/error/error-handler.model';

import {
  ELogType as logType
} from '../../models/log/log.model';
import IMonitored from '../../models/IMonitored';
import MonitoringService from '../monitoring/monitoring.service';

import {
  DatabaseDynamicType,
  DatabaseStaticType,
  DatabaseType,
  DatabaseURIType
} from '../../models/data/model';

import StaticDatabaseService from './static.database.service';
import DynamicDatabaseService from './dynamic.database.service';

/**
 * Application global database service.
 */
export default class DatabaseService implements IMonitored {
  private _monitor = new MonitoringService(this.constructor.name);

  private _staticDatabaseService = < StaticDatabaseService > {};

  private _dynamicDatabaseService = < DynamicDatabaseService > {};

  /** Retrieve dynamic database service. */
  get dynamicDatabaseService() {
    return this._dynamicDatabaseService;
  }

  /** Retrieve class monitoring service. */
  get monitor() {
    return this._monitor;
  }

  /** Retrieve static database service. */
  get staticDatabaseService() {
    return this._staticDatabaseService;
  }

  constructor(
    private _dynamicDbType: DatabaseDynamicType,
    private _staticDbType: DatabaseStaticType
  ) {}

  /**
   * Set up both dynamic and static database services.
   * @param staticDbType Static database type.
   * @param dynamicDbType Dynamic database type.
   */
  async setupDatabases(
    staticDbType = this._staticDbType,
    dynamicDbType = this._dynamicDbType
  ) {
    // prepare the function that'll be used by child db services
    const assembleURI = (dbType: DatabaseType, dbURIType: DatabaseURIType = 'cloud') => {
      switch (dbURIType) {
        case 'cloud': {
          // check on environment variables
          if (
            !process.env.DB_URI ||
            !process.env[dbType] ||
            !process.env.DB_USER_NAME ||
            !process.env.DB_USER_PASSWORD
          ) throw new ErrorHandler(500, 'Couldn\'t retrieve either cloud database URI or name, user or password from .env file.');

          return process.env.DB_URI
            .replace('<username>', process.env.DB_USER_NAME)
            .replace('<password>', process.env.DB_USER_PASSWORD)
            .replace('<dbname>', process.env[dbType] as string);
        }

        case 'local': {
          // check on environment variables
          if (
            !process.env.DB_URI_LOCAL ||
            !process.env[dbType]
          ) throw new ErrorHandler(500, 'Couldn\'t retrieve either local database URI or name.');

          return process.env.DB_URI_LOCAL
            .replace('<dbname>', process.env[dbType] as string);
        }

        default:
          throw new ErrorHandler(500, 'No valid database URI type was given during URI assembly.');
      }
    };

    // prepare the databases connection default options
    const defaultOptions = {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    };

    this._monitor.log(logType.pending, 'Setting up database services...');

    // start by setting up static db service
    this._staticDatabaseService = new StaticDatabaseService(
      assembleURI,
      staticDbType,
      defaultOptions
    );
    await this._staticDatabaseService.setupDatabase();

    // then by setting up dynamic db service
    this._dynamicDatabaseService = new DynamicDatabaseService(
      assembleURI,
      dynamicDbType,
      defaultOptions
    );
    await this._dynamicDatabaseService.setupDatabase();

    this._monitor.log(logType.pass, 'Set up database services');
  }
}