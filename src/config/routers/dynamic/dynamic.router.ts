import { Router, Request, Response, NextFunction } from 'express';

import ControllerService from '../../services/controller/controller.service';

/**
 * Father of dynamic routes.
 */
export default class DynamicRouter {
  private _router = Router();

  get router() {
    return this._router;
  }

  constructor(private _ctService: ControllerService) {
    this._configure();
  }

  /**
   * Connect routes to their matching routers.
   */
  private _configure() {
    this._router.get('/', (req: Request, res: Response, next: NextFunction) => {
      res.status(200).json('Hey big boss how are you today ?');
    });
  }
}