import { ELogType as logType } from '../../models/log/log.model';
import IMonitored from '../../models/IMonitored';
import MonitoringService from '../monitoring/monitoring.service';

import DynamicRepositoryService from '../repos/dynamic.repository.service';

import GarrisonRepository from '../../../repos/dynamic/garrison/garrison.repo';

import GarrisonController from '../../../controllers/dynamic/garrison/garrison.controller';

export default class DynamicControllerService implements IMonitored {
  private _monitor = new MonitoringService(this.constructor.name);

  private _garrisonController = <GarrisonController>{};

  /** Retrieve dynamic garrison controller. */
  get garrisonController() {
    return this._garrisonController;
  }
  
  /** Retrieve class monitoring service. */
  get monitor() {
    return this._monitor;
  }

  constructor(private _dynamicRepositories: DynamicRepositoryService['allRepositories']) {
    this._setupControllers();
  }

  /**
   * Set up all dynamic controllers.
   * @param dynamicRepositories Dynamic repositories.
   */
  private _setupControllers(
    dynamicRepositories = this._dynamicRepositories
  ) {
    this._monitor.log(logType.pending, 'Setting up dynamic controllers...');

    this._garrisonController = new GarrisonController(
      <GarrisonRepository>dynamicRepositories.find(r => r.name === 'garrison')?.repo,
    );

    this._monitor.log(logType.pass, 'Set up dynamic controllers');
  }
}