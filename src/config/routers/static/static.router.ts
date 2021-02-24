import { Router } from 'express';

import ControllerService from '../../services/controller/controller.service';

import BannerRouter from './banner.router';
import BuildingRouter from './building.router';
import FactionRouter from './faction.router';
import ResearchRouter from './research.router';
import UnitRouter from './unit.router';
import ZoneRouter from './zone.router';

/**
 * Father of statics routes.
 */
export default class StaticRouter {
  private _router = Router();
  private _bannerRouter = <BannerRouter>{};
  private _buildingRouter = <BuildingRouter>{};
  private _factionRouter = <FactionRouter>{};
  private _researchRouter = <ResearchRouter>{};
  private _unitRouter = <UnitRouter>{};
  private _zoneRouter = <ZoneRouter>{};

  get router() {
    return this._router;
  }

  constructor(private _ctService: ControllerService) {
    this._bannerRouter = new BannerRouter(this._ctService);
    this._buildingRouter = new BuildingRouter(this._ctService);
    this._factionRouter = new FactionRouter(this._ctService);
    this._researchRouter = new ResearchRouter(this._ctService);
    this._unitRouter = new UnitRouter(this._ctService);
    this._zoneRouter = new ZoneRouter(this._ctService);
    this._configure();
  }

  /**
   * Connect routes to their matching routers.
   */
  private _configure() {
    this._router.use('/banner', this._bannerRouter.router);
    this._router.use('/building', this._buildingRouter.router);
    this._router.use('/faction', this._factionRouter.router);
    this._router.use('/research', this._researchRouter.router);
    this._router.use('/unit', this._unitRouter.router);
    this._router.use('/zone', this._zoneRouter.router);
  }
}