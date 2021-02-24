import LoggerService from '../logger/logger.service';
import { ELogType as logType } from '../../models/log/log.model';

import DatabaseService from '../database/database.service';

import StaticBannerController from '../../../controllers/statics/static.banner.controller';
import StaticBuildingController from '../../../controllers/statics/static.building.controller';
import StaticFactionController from '../../../controllers/statics/static.faction.controller';
import GarrisonController from '../../../controllers/dynamic/garrison.controller';
import StaticResearchController from '../../../controllers/statics/static.research.controller';
import StaticUnitController from '../../../controllers/statics/static.unit.controller';
import StaticZoneController from '../../../controllers/statics/static.zone.controller';

/**
 * Application global controller service.
 */
export default class ControllerService {
  private _logger = new LoggerService(this.constructor.name);

  private _bannerController = <StaticBannerController>{};
  private _buildingController = <StaticBuildingController>{};
  private _factionController = <StaticFactionController>{};
  private _garrisonController = <GarrisonController>{};
  private _researchController = <StaticResearchController>{};
  private _unitController = <StaticUnitController>{};
  private _zoneController = <StaticZoneController>{};

  get bannerController() {
    return this._bannerController;
  }

  get buildingController() {
    return this._buildingController;
  }

  get factionController() {
    return this._factionController;
  }

  get garrisonController() {
    return this._garrisonController;
  }

  get researchController() {
    return this._researchController;
  }

  get unitController() {
    return this._unitController;
  }

  get zoneController() {
    return this._zoneController;
  }

  constructor(private _dbService: DatabaseService) {}

  /**
   * Configure the current controller service.
   */
  configureControllers() {
    this._logger.log(logType.pending, 'Configuring controller service...');
    this._bannerController = new StaticBannerController(this._dbService.bannerRepo);
    this._buildingController = new StaticBuildingController(this._dbService.buildingRepo);
    this._factionController = new StaticFactionController(this._dbService.factionRepo);
    this._garrisonController = new GarrisonController(this._dbService.garrisonRepo);
    this._researchController = new StaticResearchController(this._dbService.researchRepo);
    this._unitController = new StaticUnitController(this._dbService.unitRepo);
    this._zoneController = new StaticZoneController(this._dbService.zoneRepo);
    this._logger.log(logType.pass, 'Configured controller service');
  }
}