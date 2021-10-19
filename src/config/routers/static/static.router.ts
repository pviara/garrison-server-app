import ErrorHandler from '../../models/error/error-handler.model';

import { ELogType as logType } from '../../models/log/log.model';
import IMonitored from '../../models/IMonitored';
import MonitoringService from '../../services/monitoring/monitoring.service';

import { NextFunction, Request, Response, Router } from 'express';

import StaticControllerService from '../../services/controller/static.controller.service';

import BannerRouter from './banner.router';
import BuildingRouter from './building.router';
import FactionRouter from './faction.router';
import ResearchRouter from './research.router';
import UnitRouter from './unit.router';
import ZoneRouter from './zone.router';

import jwt from 'jsonwebtoken';
import SignedRequest from '../../models/data/express/SignedRequest';
import { IUser } from '../../models/data/dynamic/user/user.types';

/**
 * Father of statics routes.
 */
export default class StaticRouter implements IMonitored {
  private _monitor = new MonitoringService(this.constructor.name);
  
  private _router = Router();
  private _bannerRouter = <BannerRouter>{};
  private _buildingRouter = <BuildingRouter>{};
  private _factionRouter = <FactionRouter>{};
  private _researchRouter = <ResearchRouter>{};
  private _unitRouter = <UnitRouter>{};
  private _zoneRouter = <ZoneRouter>{};
  
  /** Retrieve class monitoring service. */
  get monitor() {
    return this._monitor;
  }

  get router() {
    return this._router;
  }

  constructor(private _staticControllerService: StaticControllerService) {
    this._setupRoutes();
  }

  /**
   * Connect routes to their matching routers.
   */
  private _setupRoutes() {
    this._monitor.log(logType.pending, 'Setting up static routes...');

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
    
    this._bannerRouter = new BannerRouter(this._staticControllerService.bannerController);
    this._router.use('/banner', this._bannerRouter.router);
    
    this._buildingRouter = new BuildingRouter(this._staticControllerService.buildingController);
    this._router.use('/building', this._buildingRouter.router);
    
    this._factionRouter = new FactionRouter(this._staticControllerService.factionController);
    this._router.use('/faction', this._factionRouter.router);
    
    this._researchRouter = new ResearchRouter(this._staticControllerService.researchController);
    this._router.use('/research', this._researchRouter.router);
    
    this._unitRouter = new UnitRouter(this._staticControllerService.unitController);
    this._router.use('/unit', this._unitRouter.router);
    
    this._zoneRouter = new ZoneRouter(this._staticControllerService.zoneController);
    this._router.use('/zone', this._zoneRouter.router);

    this._router
      .stack
      .forEach(route => {
        this.monitor.log(logType.pass, `Set up static route ${route.regexp}`);
      });
    
    this._monitor.log(logType.pass, 'Set up static routes');
  }
}