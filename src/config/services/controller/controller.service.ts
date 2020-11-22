import LoggerService from '../logger/logger.service';
import { ELogType as logType } from '../../models/log/log.model';

import DatabaseService from '../database/database.service';

import BannerController from '../../../controllers/statics/banner.controller';
import BuildingController from '../../../controllers/statics/building.controller';
import FactionController from '../../../controllers/statics/faction.controller';
import GarrisonController from '../../../controllers/dynamic/garrison.controller';
import ResearchController from '../../../controllers/statics/research.controller';
import UnitController from '../../../controllers/statics/unit.controller';
import ZoneController from '../../../controllers/statics/zone.controller';

/**
 * Application global controller service.
 */
export default class ControllerService {
  private _logger = new LoggerService(this.constructor.name);

  private _bannerController = <BannerController>{};
  private _buildingController = <BuildingController>{};
  private _factionController = <FactionController>{};
  private _garrisonController = <GarrisonController>{};
  private _researchController = <ResearchController>{};
  private _unitController = <UnitController>{};
  private _zoneController = <ZoneController>{};

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
    this._bannerController = new BannerController(this._dbService.bannerRepo);
    this._buildingController = new BuildingController(this._dbService.buildingRepo);
    this._factionController = new FactionController(this._dbService.factionRepo);
    this._garrisonController = new GarrisonController(this._dbService.garrisonRepo);
    this._researchController = new ResearchController(this._dbService.researchRepo);
    this._unitController = new UnitController(this._dbService.unitRepo);
    this._zoneController = new ZoneController(this._dbService.zoneRepo);
    this._logger.log(logType.pass, 'Configured controller service');
  }
}