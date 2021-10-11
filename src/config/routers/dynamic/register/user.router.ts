import { ELogType as logType } from '../../../../config/models/log/log.model';
import IMonitored from '../../../models/IMonitored';
import MonitoringService from '../../../services/monitoring/monitoring.service'

import { Router, Request, Response, NextFunction } from 'express';
import SignedRequest from '../../../models/data/express/SignedRequest';

import RegisterController from '../../../../controllers/dynamic/register/register.controller';

/**
 * Father of register routes.
 */
export default class RegisterRouter implements IMonitored {
  private _monitor = new MonitoringService(this.constructor.name);
  
  private _router = Router();
  
  /** Retrieve class monitoring service. */
  get monitor() {
    return this._monitor;
  }

  get router() {
    return this._router;
  }

  constructor(private _controller: RegisterController) {
    this._setupRoutes();
  }

  /**
   * Connect routes to their matching controller methods.
   */
  private _setupRoutes() {
    this._monitor.log(logType.pending, 'Setting up register routes...');

    this._router.get('/:garrisonId', (req: Request, res: Response, next: NextFunction) => {
      this._controller.getFromGarrison(req as SignedRequest, res, next)
        .then(result => {
          res.status(200).json(result)
        })
        .catch(error => next(error));
    });

    this._router
      .stack
      .forEach(route => {
        this.monitor.log(logType.pass, `Set up register route ${route.regexp}`);
      });

    this._monitor.log(logType.pass, 'Set up register routes');
  }
}