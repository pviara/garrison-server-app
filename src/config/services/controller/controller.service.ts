import { ELogType as logType } from '../../models/log/log.model';
import IMonitored from '../../models/IMonitored';
import MonitoringService from '../monitoring/monitoring.service';

import DynamicRepositoryService from '../repos/dynamic.repository.service';
import StaticRepositoryService from '../repos/static.repository.service';

import DynamicControllerService from './dynamic.controller.service';
import StaticControllerService from './static.controller.service';

/**
 * Application global controller service.
 */
export default class ControllerService implements IMonitored {
  private _monitor = new MonitoringService(this.constructor.name);

  private _dynamicControllerService = <DynamicControllerService>{};
  private _staticControllerService = <StaticControllerService>{};

  /** Retrieve dynamic controller service. */
  get dynamicControllerService() {
    return this._dynamicControllerService;
  }
  
  /** Retrieve class monitoring service. */
  get monitor() {
    return this._monitor;
  }

  /** Retrieve static controller service. */
  get staticControllerService() {
    return this._staticControllerService;
  }

  constructor(
    private _dynamicRepositories: DynamicRepositoryService['allRepositories'],
    private _staticRepositories: StaticRepositoryService['allRepositories']
  ) {
    this._setupControllers();
  }

  /**
   * Setup both dynamic and static controller services.
   * @param dynamicRepos Dynamic repositories.
   * @param staticRepos Static repositories.
   */
  private _setupControllers(
    dynamicRepos = this._dynamicRepositories,
    staticRepos = this._staticRepositories
  ) {
    this._monitor.log(logType.pending, 'Setting up controller services...');

    this._staticControllerService = new StaticControllerService(staticRepos);
    this._dynamicControllerService = new DynamicControllerService(dynamicRepos);
    
    this._monitor.log(logType.pass, 'Set up controller services');
  }
}