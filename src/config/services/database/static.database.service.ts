// ? Remove ? import ErrorHandler from '../../models/error/error-handler.model';

import { ELogType as logType } from '../../models/log/log.model';
import IMonitored from '../../models/IMonitored';
import MonitoringService from '../monitoring/monitoring.service';

import { DatabaseStaticType } from '../../models/data/model';

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
   * @param Options Database connection default options.
   */
  async setupDatabase(
    staticDbType = this._dbType,
    assembleURI = this._assembleURI,
    options = this._options
  ) {
    this.monitor.log(logType.pending, `Setting up database ${this._dbType}`);
    this.monitor.log(logType.pending, `Establishing connection with ${this._dbType}...`);

    // assemble static database URI and establish connection
    const assembledURI = assembleURI(staticDbType);
    this._connection = await mongoose.createConnection(assembledURI, options);

    this.monitor.log(logType.pass, `Established connection with database '${this._connection.name}'`);

    // init static model service and setup static models
    this._staticModelService = new StaticModelService(this._connection);
    await this._staticModelService.setupModels();

    this.monitor.log(logType.pass, `Set up database ${this._dbType}`);
    
    // return the getter property
    return this.connection;
  }
}