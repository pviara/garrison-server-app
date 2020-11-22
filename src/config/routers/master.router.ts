import { Router } from 'express';

import ControllerService from '../services/controller/controller.service';

import DynamicRouter from './dynamic/dynamic.router';
import StaticsRouter from './statics/statics.router';

/**
 * Father of all routes.
 */
export default class MasterRouter {
  private _router = Router();
  private _staticsRouter = <StaticsRouter>{};
  private _dynamicRouter = <DynamicRouter>{};

  get router() {
    return this._router;
  }

  constructor(private _ctService: ControllerService) {
    this._staticsRouter = new StaticsRouter(this._ctService);
    this._dynamicRouter = new DynamicRouter(this._ctService);
    this._configure();
  }

  /**
   * Connect routes to their matching routers.
   */
  private _configure() {
    this._router.use('/statics', this._staticsRouter.router);
    this._router.use('/dynamic', this._dynamicRouter.router);
  }
}