import { Router } from 'express';

import ControllerService from '../../services/controller/controller.service';

import GarrisonRouter from './garrison/garrison.router';

/**
 * Father of dynamic routes.
 */
export default class DynamicRouter {
  private _router = Router();
  private _garrisonRouter = <GarrisonRouter>{};

  get router() {
    return this._router;
  }

  constructor(private _ctService: ControllerService) {
    this._garrisonRouter = new GarrisonRouter(this._ctService);
    this._configure();
  }

  /**
   * Connect routes to their matching routers.
   */
  private _configure() {
    this._router.use('/garrison', this._garrisonRouter.router);
  }
}