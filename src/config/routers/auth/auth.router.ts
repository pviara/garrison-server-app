import { ELogType as logType } from '../../models/log/log.model';
import IMonitored from '../../models/IMonitored';
import MonitoringService from '../../services/monitoring/monitoring.service'

import { Router, Request, Response, NextFunction } from 'express';

import AuthController from '../../../controllers/dynamic/auth/auth.controller';

/**
 * Father of authentication routes.
 */
export default class AuthRouter implements IMonitored {
  private _monitor = new MonitoringService(this.constructor.name);
  
  private _router = Router();
  
  /** Retrieve class monitoring service. */
  get monitor() {
    return this._monitor;
  }

  get router() {
    return this._router;
  }

  constructor(private _controller: AuthController) {
    this._setupRoutes();
  }

  /**
   * Connect routes to their matching controller methods.
   */
  private _setupRoutes() {
    this._monitor.log(logType.pending, 'Setting up auth routes...');

    this._router.post('/', (req: Request, res: Response, next: NextFunction) => {
      this._controller.authenticate(req, res, next)
        .then(result => {
          res.status(200).json(result)
        })
        .catch(error => next(error));
    });

    this._router
      .stack
      .forEach(route => {
        this.monitor.log(logType.pass, `Set up auth route ${route.regexp}`);
      });

    this._monitor.log(logType.pass, 'Set up auth routes');
  }
}