import { ELogType as logType } from '../../../../config/models/log/log.model';
import IMonitored from '../../../models/IMonitored';
import MonitoringService from '../../../services/monitoring/monitoring.service'

import { Router, Request, Response, NextFunction } from 'express';

import CharacterController from '../../../../controllers/dynamic/character/character.controller';

/**
 * Father of character routes.
 */
export default class CharacterRouter implements IMonitored {
  private _monitor = new MonitoringService(this.constructor.name);
  
  private _router = Router();
  
  /** Retrieve class monitoring service. */
  get monitor() {
    return this._monitor;
  }

  get router() {
    return this._router;
  }

  constructor(private _controller: CharacterController) {
    this._setupRoutes();
  }

  /**
   * Connect routes to their matching controller methods.
   */
  private _setupRoutes() {
    this._monitor.log(logType.pending, 'Setting up character routes...');

    this._router.get('/:userId', (req: Request, res: Response, next: NextFunction) => {
      this._controller.getFromUser(req, res, next)
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

    this._router
      .stack
      .forEach(route => {
        this.monitor.log(logType.pass, `Set up character route ${route.regexp}`);
      });

    this._monitor.log(logType.pass, 'Set up character routes');
  }
}