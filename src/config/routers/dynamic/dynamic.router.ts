
import ErrorHandler from '../../models/error/error-handler.model';

import { ELogType as logType } from '../../models/log/log.model';
import IMonitored from '../../models/IMonitored';
import MonitoringService from '../../services/monitoring/monitoring.service';

import { NextFunction, Request, Response, Router } from 'express';

import DynamicControllerService from '../../services/controller/dynamic.controller.service';

import CharacterRouter from './character/character.router';
import GarrisonRouter from './garrison/garrison.router';

import { IUser } from '../../models/data/dynamic/user/user.types';

import jwt from 'jsonwebtoken';
import SignedRequest from '../../models/data/express/SignedRequest';
import RegisterRouter from './register/user.router';

/**
 * Father of dynamic routes.
 */
export default class DynamicRouter implements IMonitored {
  private _monitor = new MonitoringService(this.constructor.name);

  private _router = Router();
  private _characterRouter = <CharacterRouter>{};
  private _garrisonRouter = <GarrisonRouter>{};
  private _registerRouter = <RegisterRouter>{};
  
  /** Retrieve class monitoring service. */
  get monitor() {
    return this._monitor;
  }

  get router() {
    return this._router;
  }

  constructor(private _dynamicControllerService: DynamicControllerService) {
    this._setupRoutes();
  }

  /**
   * Connect routes to their matching routers.
   */
  private _setupRoutes() {
    this._monitor.log(logType.pending, 'Setting up dynamic routes...');

    this._router.use((req: Request, res: Response, next: NextFunction) => {
      if (!req.headers.authorization)
        throw new ErrorHandler(401, 'Missing authorization headers.');
      
      // we split it because it looks like 'Bearer tkEOa3941ks...'
      // and we don't want the word 'Bearer' in final token value
      const [
        type,
        token
      ] = req.headers.authorization.split(' ');
      
      let user;
      try { user = jwt.verify(token, process.env.JWT as string); }
      catch (e) { throw new ErrorHandler(401, 'Invalid token.'); }

      (req as SignedRequest).author = user as Partial<IUser>;
      
      next();
    });

    this._characterRouter = new CharacterRouter(this._dynamicControllerService.characterController);
    this._router.use('/character', this._characterRouter.router);

    this._garrisonRouter = new GarrisonRouter(this._dynamicControllerService.garrisonController);
    this._router.use('/garrison', this._garrisonRouter.router);

    this._registerRouter = new RegisterRouter(this._dynamicControllerService.registerController);
    this._router.use('/register', this._registerRouter.router);

    this._router
      .stack
      .forEach(route => {
        this.monitor.log(logType.pass, `Set up dynamic route ${route.regexp}`);
      });

    this._monitor.log(logType.pass, 'Set up dynamic routes');
  }
}