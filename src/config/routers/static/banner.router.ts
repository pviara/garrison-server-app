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

import BannerController from '../../../controllers/static/banner.controller';

/**
 * Father of banner routes.
 */
export default class BannerRouter implements IMonitored {
  private _monitor = new MonitoringService(this.constructor.name);

  private _router = Router();

  /** Retrieve class monitoring service. */
  get monitor() {
    return this._monitor;
  }

  get router() {
    return this._router;
  }

  constructor(private _controller: BannerController) {
    this._setupRoutes();
  }

  /**
   * Connect routes to their matching controller methods.
   */
  private _setupRoutes() {
    this._monitor.log(logType.pending, 'Setting up banner routes...');

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
        this.monitor.log(logType.pass, `Set up banner route ${route.regexp}`);
      });

    this._monitor.log(logType.pass, 'Set up banner routes');
  }
}