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
   * @param options Database connection default options.
   */
  async setupDatabase(
    dynamicDbType = this._dbType,
    assembleURI = this._assembleURI,
    options = this._options
  ) {
    try {
      this.monitor.log(logType.pending, `Setting up database ${this._dbType}`);
      this.monitor.log(logType.pending, `Establishing connection with ${this._dbType}...`);

      // assemble static database URI and establish cloud connection
      const assembledURI = assembleURI(dynamicDbType, 'cloud');
      this._connection = await mongoose.createConnection(assembledURI, options);
    } catch (e) {
      this._monitor.log(logType.fail, `Failed to create connection with cloud database ${this._dbType}`);
      this._monitor.log(logType.pending, `Trying to create connection with local database ${this._dbType}...`);
      
      // assemble static database URI and establish local connection
      const assembledURI = assembleURI(dynamicDbType, 'local');
      this._connection = await mongoose.createConnection(assembledURI, options);
    }

    this.monitor.log(logType.pass, `Established connection with database '${this._connection.name}'`);
    
    // init dynamic model service and setup static models
    this._dynamicModelService = new DynamicModelService(this._connection);
    await this._dynamicModelService.setupModels();
    
    this.monitor.log(logType.pass, `Set up database ${this._dbType}`);

    // return the getter property
    return this.connection;
  }
}