import { Router, Request, Response, NextFunction } from 'express';

import ControllerService from '../../services/controller/controller.service';

import StaticBannerController from '../../../controllers/statics/static.banner.controller';

/**
 * Father of banner routes.
 */
export default class BannerRouter {
  private _router = Router();

  private _controller = <StaticBannerController>{};

  get router() {
    return this._router;
  }

  constructor(private _ctService: ControllerService) {
    this._controller = this._ctService.bannerController;
    this._configure();
  }

  /**
   * Connect routes to their matching controller methods.
   */
  private _configure() {
    this._router.get('/', (req: Request, res: Response, next: NextFunction) => {
      this._controller.getAll(req, res, next)
        .then(result => {
          res.status(200).json(result)
        })
        .catch(error => next(error));
    });

    this._router.get('/:code', (req: Request, res: Response, next: NextFunction) => {
      this._controller.get(req, res, next)
        .then(result => {
          res.status(200).json(result)
        })
        .catch(error => next(error));
    });
  }
}