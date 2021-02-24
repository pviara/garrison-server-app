import { Router, Request, Response, NextFunction } from 'express';

import ControllerService from '../../../services/controller/controller.service';

import GarrisonController from '../../../../controllers/dynamic/garrison/garrison.controller';

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
    
    this._router.post('/building', (req: Request, res: Response, next: NextFunction) => {
      this._controller.addBuilding(req, res, next)
        .then(result => {
          res.status(200).json(result)
        })
        .catch(error => next(error));
    });
    
    this._router.put('/building/upgrade', (req: Request, res: Response, next: NextFunction) => {
      this._controller.upgradeBuilding(req, res, next)
        .then(result => {
          res.status(200).json(result)
        })
        .catch(error => next(error));
    });
    
    this._router.put('/building/extend', (req: Request, res: Response, next: NextFunction) => {
      this._controller.extendBuilding(req, res, next)
        .then(result => {
          res.status(200).json(result)
        })
        .catch(error => next(error));
    });
    
    this._router.put('/building/cancel', (req: Request, res: Response, next: NextFunction) => {
      this._controller.cancelConstruction(req, res, next)
        .then(result => {
          res.status(200).json(result)
        })
        .catch(error => next(error));
    });
    
    this._router.post('/unit', (req: Request, res: Response, next: NextFunction) => {
      this._controller.addUnit(req, res, next)
        .then(result => {
          res.status(200).json(result)
        })
        .catch(error => next(error));
    });

    this._router.put('/unit/assign', (req: Request, res: Response, next: NextFunction) => {
      this._controller.assignUnit(req, res, next)
        .then(result => {
          res.status(200).json(result)
        })
        .catch(error => next(error));
    });

    this._router.put('/unit/unassign', (req: Request, res: Response, next: NextFunction) => {
      this._controller.unassignUnit(req, res, next)
        .then(result => {
          res.status(200).json(result)
        })
        .catch(error => next(error));
    });
  }
}