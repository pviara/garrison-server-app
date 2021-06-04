import { ELogType as logType } from '../models/log/log.model';
import IMonitored from '../models/IMonitored';
import MonitoringService from '../services/monitoring/monitoring.service';

import { Router } from 'express';

import ControllerService from '../services/controller/controller.service';

import AuthRouter from './auth/auth.router';
import DynamicRouter from './dynamic/dynamic.router';
import StaticRouter from './static/static.router';

/**
 * Father of all routes.
 */
export default class MasterRouter implements IMonitored {
  private _monitor = new MonitoringService(this.constructor.name);

  private _router = Router();
  private _authRouter = <AuthRouter>{};
  private _dynamicRouter = <DynamicRouter>{};
  private _staticRouter = <StaticRouter>{};
  
  /** Retrieve class monitoring service. */
  get monitor() {
    return this._monitor;
  }

  get router() {
    return this._router;
  }

  constructor(private _controllerService: ControllerService) {
    this._setupRoutes();
  }

  /**
   * Connect routes to their matching routers.
   */
  private _setupRoutes() {
    this._monitor.log(logType.pending, 'Setting up application routes...');

    this._authRouter = new AuthRouter(
      this.
        _controllerService
        .dynamicControllerService
        .authController
    );
    this._router.use('/auth', this._authRouter.router);

    this._dynamicRouter = new DynamicRouter(this._controllerService.dynamicControllerService);
    this._router.use('/dynamic', this._dynamicRouter.router);

    this._staticRouter = new StaticRouter(this._controllerService.staticControllerService);
    this._router.use('/static', this._staticRouter.router);

    this._router
      .stack
      .forEach(route => {
        this.monitor.log(logType.pass, `Set up application route ${route.regexp}`);
      });

    this._monitor.log(logType.pass, 'Set up application routes');
  }
}