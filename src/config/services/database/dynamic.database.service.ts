import { ELogType as logType } from '../../models/log/log.model';
import IMonitored from '../../models/IMonitored';
import MonitoringService from '../monitoring/monitoring.service';

import { DatabaseDynamicType } from '../../models/data/model';

import {
  DatabaseConnectionOptions,
  ISpecificDatabaseService,
  URIAssemblyCallback
} from '../../models/ISpecificDatabaseService';

import mongoose, { Connection } from 'mongoose';
import DynamicModelService from '../models/dynamic.model.service';

export default class DynamicDatabaseService implements IMonitored, ISpecificDatabaseService<DatabaseDynamicType> {
  private _connection = {} as Connection;

  private _monitor = new MonitoringService(this.constructor.name);

  private _dynamicModelService = <DynamicModelService>{};

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

  /** Retrieve dynamic model service. */
  get dynamicModelService() {
    return this._dynamicModelService;
  }

  constructor(
    private _assembleURI: URIAssemblyCallback,
    private _dbType: DatabaseDynamicType,
    private _options: DatabaseConnectionOptions
  ) {}

  /**
   * Setup dynamic database.
   * @param dynamicDbType Dynamic database type.
   * @param assembleURI Given parent's method to assemble the final dynamic database URI.
   */
  async setupDatabase(
    dynamicDbType = this._dbType,
    assembleURI = this._assembleURI
  ) {
    this.monitor.log(logType.pending, `Setting up database ${this._dbType}`);
    this.monitor.log(logType.pending, `Establishing connection with database ${this._dbType}...`);

    // assemble dynamic database URI and establish connection
    const assembledURI = assembleURI(dynamicDbType);
    this._connection = await mongoose.createConnection(assembledURI, this._options);

    this.monitor.log(logType.pass, `Established connection with database '${this._connection.name}'`);
    
    // init dynamic model service and setup static models
    this._dynamicModelService = new DynamicModelService(this._connection);
    await this._dynamicModelService.setupModels();
    
    this.monitor.log(logType.pass, `Set up database ${this._dbType}`);

    // return the getter property
    return this.connection;
  }
}