import {
  ELogType as logType
} from '../../../config/models/log/log.model';
import IMonitored from '../../models/IMonitored';
import MonitoringService from '../../services/monitoring/monitoring.service'

import {
  Router,
  Request,
  Response,
  NextFunction
} from 'express';

import FactionController from '../../../controllers/static/faction.controller';

/**
 * Father of faction routes.
 */
export default class FactionRouter implements IMonitored {
  private _monitor = new MonitoringService(this.constructor.name);

  private _router = Router();

  /** Retrieve class monitoring service. */
  get monitor() {
    return this._monitor;
  }

  get router() {
    return this._router;
  }

  constructor(private _controller: FactionController) {
    this.setupRoutes();
  }

  /**
   * Connect routes to their matching controller methods.
   */
  private setupRoutes() {
    this._monitor.log(logType.pending, 'Setting up faction routes...');

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

    this._router
      .stack
      .forEach(route => {
        this.monitor.log(logType.pass, `Set up faction route ${route.regexp}`);
      });

    this._monitor.log(logType.pass, 'Set up faction routes');
  }
}