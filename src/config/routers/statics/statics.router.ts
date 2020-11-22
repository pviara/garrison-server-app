import { Router, Request, Response, NextFunction } from 'express';

import ControllerService from '../../services/controller/controller.service';

import BannerRouter from './banner/banner.router';

/**
 * Father of statics routes.
 */
export default class StaticsRouter {
  private _router = Router();
  private _bannerRouter = <BannerRouter>{};

  get router() {
    return this._router;
  }

  constructor(private _ctService: ControllerService) {
    this._bannerRouter = new BannerRouter(this._ctService);
    this._configure();
  }

  /**
   * Connect routes to their matching routers.
   */
  private _configure() {
    this._router.use('/banner', this._bannerRouter.router);
  }
}