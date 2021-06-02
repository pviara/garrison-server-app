import { ELogType as logType } from '../../models/log/log.model';
import IMonitored from '../../models/IMonitored';
import MonitoringService from '../../services/monitoring/monitoring.service';

import { Router } from 'express';

import DynamicControllerService from '../../services/controller/dynamic.controller.service';

import CharacterRouter from './character/character.router';
import GarrisonRouter from './garrison/garrison.router';

/**
 * Father of dynamic routes.
 */
export default class DynamicRouter implements IMonitored {
  private _monitor = new MonitoringService(this.constructor.name);

  private _router = Router();
  private _characterRouter = <CharacterRouter>{};
  private _garrisonRouter = <GarrisonRouter>{};
  
  /** Retrieve class monitoring service. */
  get monitor() {
    return this._monitor;
  }

  get router() {
    return this._router;
  }

  constructor(private _dynamicControllerService: DynamicControllerService) {
    this._setupRoutes();
  }

  /**
   * Connect routes to their matching routers.
   */
  private _setupRoutes() {
    this._monitor.log(logType.pending, 'Setting up dynamic routes...');

    this._characterRouter = new CharacterRouter(this._dynamicControllerService.characterController);
    this._router.use('/character', this._characterRouter.router);

    this._garrisonRouter = new GarrisonRouter(this._dynamicControllerService.garrisonController);
    this._router.use('/garrison', this._garrisonRouter.router);

    this._router
      .stack
      .forEach(route => {
        this.monitor.log(logType.pass, `Set up dynamic route ${route.regexp}`);
      });

    this._monitor.log(logType.pass, 'Set up dynamic routes');
  }
}