import { ELogType as logType } from '../../../config/models/log/log.model';
import IMonitored from '../../models/IMonitored';
import MonitoringService from '../monitoring/monitoring.service';

import { Model, Document } from 'mongoose';

import DynamicRepositoryService from './dynamic.repository.service';
import StaticRepositoryService from './static.repository.service';

export type ModelRetrievingCallback = (name: string, models: Model<Document, {}>[]) => Model<Document, {}> | undefined;

export default class RepositoryService implements IMonitored {
  private _monitor = new MonitoringService(this.constructor.name);

  private _dynamicRepositoryService = <DynamicRepositoryService>{};
  private _staticRepositoryService = <StaticRepositoryService>{};
  
  /** Retrieve class monitoring service. */
  get monitor() {
    return this._monitor;
  }
  
  /** Retrieve dynamic repository service. */
  get dynamicRepositoryService() {
    return this._dynamicRepositoryService;
  }
  
  /** Retrieve static repository service. */
  get staticRepositoryService() {
    return this._staticRepositoryService;
  }
  
  constructor(
    private _dynamicModels: Model<Document, {}>[],
    private _staticModels: Model<Document, {}>[]
  ) {
    this._setupRepositories();
  }

  /**
   * Setup both dynamic and static repository services.
   * @param staticModels Static models.
   * @param dynamicModels Dynamic models.
   */
  private _setupRepositories(
    staticModels = this._staticModels,
    dynamicModels = this._dynamicModels
  ) {
    this._monitor.log(logType.pending, 'Setting up repository services...');
    
    // prepare the function that'll be used by child rp services
    const findModelByName = (name: string, models: Model<Document, {}>[]) => {
      return models.find(model => model.modelName == name);
    };
    
    this._staticRepositoryService = new StaticRepositoryService(
      findModelByName,
      staticModels
    );

    // ----------------------------------------------------------------
    
    this._dynamicRepositoryService = new DynamicRepositoryService(
      findModelByName,
      dynamicModels,
      this.staticRepositoryService.allRepositories
    );

    this._monitor.log(logType.pass, 'Set up repository services');
  }
}