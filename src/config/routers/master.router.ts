import { Router } from 'express';

import ControllerService from '../services/controller/controller.service';

import DynamicRouter from './dynamic/dynamic.router';
import StaticRouter from './static/static.router';

/**
 * Father of all routes.
 */
export default class MasterRouter {
  private _router = Router();
  private _staticRouter = <StaticRouter>{};
  private _dynamicRouter = <DynamicRouter>{};

  get router() {
    return this._router;
  }

  constructor(private _ctService: ControllerService) {
    this._staticRouter = new StaticRouter(this._ctService);
    this._dynamicRouter = new DynamicRouter(this._ctService);
    this._configure();
  }

  /**
   * Connect routes to their matching routers.
   */
  private _configure() {
    this._router.use('/static', this._staticRouter.router);
    this._router.use('/dynamic', this._dynamicRouter.router);
  }
}