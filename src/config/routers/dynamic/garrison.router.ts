import { Router, Request, Response, NextFunction } from 'express';

import ControllerService from '../../services/controller/controller.service';

import GarrisonController from '../../../controllers/dynamic/garrison.controller';

/**
 * Father of garrison routes.
 */
export default class GarrisonRouter {
  private _router = Router();

  private _controller = <GarrisonController>{};

  get router() {
    return this._router;
  }

  constructor(private _ctService: ControllerService) {
    this._controller = this._ctService.garrisonController;
    this._configure();
  }

  /**
   * Connect routes to their matching controller methods.
   */
  private _configure() {
    this._router.get('/:userId', (req: Request, res: Response, next: NextFunction) => {
      this._controller.get(req, res, next)
        .then(result => {
          res.status(200).json(result)
        })
        .catch(error => next(error));
    });
    
    this._router.post('/', (req: Request, res: Response, next: NextFunction) => {
      this._controller.create(req, res, next)
        .then(result => {
          res.status(200).json(result)
        })
        .catch(error => next(error));
    });
  }
}