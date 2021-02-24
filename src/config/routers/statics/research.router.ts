import { Router, Request, Response, NextFunction } from 'express';

import ControllerService from '../../services/controller/controller.service';

import StaticResearchController from '../../../controllers/statics/static.research.controller';

/**
 * Father of research routes.
 */
export default class ResearchRouter {
  private _router = Router();

  private _controller = <StaticResearchController>{};

  get router() {
    return this._router;
  }

  constructor(private _ctService: ControllerService) {
    this._controller = this._ctService.researchController;
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