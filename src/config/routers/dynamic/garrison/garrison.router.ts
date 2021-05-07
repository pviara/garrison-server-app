import { ELogType as logType } from '../../../../config/models/log/log.model';
import IMonitored from '../../../models/IMonitored';
import MonitoringService from '../../../services/monitoring/monitoring.service'

import { Router, Request, Response, NextFunction } from 'express';

import GarrisonController from '../../../../controllers/dynamic/garrison/garrison.controller';

/**
 * Father of garrison routes.
 */
export default class GarrisonRouter implements IMonitored {
  private _monitor = new MonitoringService(this.constructor.name);
  
  private _router = Router();
  
  /** Retrieve class monitoring service. */
  get monitor() {
    return this._monitor;
  }

  get router() {
    return this._router;
  }

  constructor(private _controller: GarrisonController) {
    this._setupRoutes();
  }

  /**
   * Connect routes to their matching controller methods.
   */
  private _setupRoutes() {
    this._monitor.log(logType.pending, 'Setting up garrison routes...');

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
      this._controller.assignUnitRandomly(req, res, next)
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
    
    this._router.put('/unit/cancel', (req: Request, res: Response, next: NextFunction) => {
      this._controller.cancelUnitTraining(req, res, next)
        .then(result => {
          res.status(200).json(result)
        })
        .catch(error => next(error));
    });
    
    this._router.post('/research', (req: Request, res: Response, next: NextFunction) => {
      this._controller.launchResearch(req, res, next)
        .then(result => {
          res.status(200).json(result)
        })
        .catch(error => next(error));
    });
    
    this._router.put('/research/cancel', (req: Request, res: Response, next: NextFunction) => {
      this._controller.cancelResearch(req, res, next)
        .then(result => {
          res.status(200).json(result)
        })
        .catch(error => next(error));
    });

    this._router
      .stack
      .forEach(route => {
        this.monitor.log(logType.pass, `Set up garrison route ${route.regexp}`);
      });

    this._monitor.log(logType.pass, 'Set up garrison routes');
  }
}