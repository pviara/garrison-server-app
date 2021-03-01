// ? Remove ? import ErrorHandler from '../../models/error/error-handler.model';

import { ELogType as logType } from '../../models/log/log.model';
import IMonitored from '../../models/IMonitored';
import MonitoringService from '../monitoring/monitoring.service';

import {
  DatabaseStaticType,
  DatabaseURIType
 } from '../../models/data/model';

import {
  DatabaseConnectionOptions,
  ISpecificDatabaseService,
  URIAssemblyCallback
} from '../../models/ISpecificDatabaseService';

import mongoose, { Connection } from 'mongoose';
import StaticModelService from '../models/static.model.service';

export default class StaticDatabaseService implements IMonitored, ISpecificDatabaseService<DatabaseStaticType> {
  private _connection = {} as Connection;

  private _monitor = new MonitoringService(this.constructor.name);

  private _staticModelService = <StaticModelService>{};
  
  /** Retrieve static database connection. */
  get connection() {
    return this._connection;
  }

  /** Retrieve static database type. */
  get databaseType() {
    return this._dbType;
  }

  /** Retrieve class monitoring service. */
  get monitor() {
    return this._monitor;
  }

  /** Retrieve static model service. */
  get staticModelService() {
    return this._staticModelService;
  }

  constructor(
    private _assembleURI: URIAssemblyCallback,
    private _dbType: DatabaseStaticType,
    private _options: DatabaseConnectionOptions
  ) {}

  /**
   * Setup static database.
   * @param staticDbType Static database type.
   * @param assembleURI Given parent's method to assemble the final static database URI.
   * @param options Database connection default options.
   */
  async setupDatabase(
    staticDbType = this._dbType,
    assembleURI = this._assembleURI,
    options = this._options
  ) {
    const createConnection = async (connectionType: DatabaseURIType = 'cloud') => {
      try {
        this.monitor.log(logType.pending, `Setting up database ${this._dbType}`);
        this.monitor.log(logType.pending, `Establishing connection with ${connectionType} database ${this._dbType}...`);
  
        // assemble static database URI and establish cloud connection
        const assembledURI = assembleURI(staticDbType, connectionType);
        return {
          connectionType,
          connection: await mongoose.createConnection(assembledURI, options)
        };
      } catch (e) {
        this._monitor.log(logType.fail, `Failed to create connection with ${connectionType} database ${this._dbType}`);

        // but if the current connection type is cloud it means that local connection hasn't been tried yet!
        connectionType = 'local';
        
        this._monitor.log(logType.pending, `Trying to create connection with local database ${this._dbType}...`);
        
        try {
          // assemble static database URI and establish local connection
          const assembledURI = assembleURI(staticDbType, connectionType);
          const lastConnectionTry = await mongoose.createConnection(assembledURI, options);
        
          return {
            connectionType,
            connection: lastConnectionTry
          };
        } catch (e) { 
          this._monitor.log(logType.fail, `Failed to create connection with local database ${this._dbType}`);
          this._monitor.log(logType.fail, '  This might occurs because your local MongoDB Database Server is inactive');
          this._monitor.log(logType.fail, '  Aborted process');

          // no need to retry if it's already been tried with local connection : an error is an error...
          throw e;
        }
      }
    };

    const { connection, connectionType } = await createConnection('cloud');
    this._connection = connection;
    this.monitor.log(logType.pass, `Established connection with ${connectionType} database '${this._connection.name}'`);

    // init static model service and setup static models
    this._staticModelService = new StaticModelService(this._connection);
    await this._staticModelService.setupModels();

    this.monitor.log(logType.pass, `Set up database ${this._dbType}`);
    
    // return the getter property
    return this.connection;
  }
}