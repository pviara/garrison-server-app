import { ELogType as logType } from '../../models/log/log.model';
import IMonitored from '../../models/IMonitored';
import MonitoringService from '../monitoring/monitoring.service';

import StaticRepositoryService from '../repos/static.repository.service';

import BannerRepository from '../../../repos/static/banner.repo';
import BuildingRepository from '../../../repos/static/building.repo';
import FactionRepository from '../../../repos/static/faction.repo';
import UnitRepository from '../../../repos/static/unit.repo';
import ResearchRepository from '../../../repos/static/research.repo';
import ZoneRepository from '../../../repos/static/zone.repo';

import BannerController from '../../../controllers/static/banner.controller';
import BuildingController from '../../../controllers/static/building.controller';
import FactionController from '../../../controllers/static/faction.controller';
import ResearchController from '../../../controllers/static/research.controller';
import UnitController from '../../../controllers/static/unit.controller';
import ZoneController from '../../../controllers/static/zone.controller';

export default class StaticControllerService implements IMonitored {
  private _monitor = new MonitoringService(this.constructor.name);

  private _bannerController = <BannerController>{};
  private _buildingController = <BuildingController>{};
  private _factionController = <FactionController>{};
  private _researchController = <ResearchController>{};
  private _unitController = <UnitController>{};
  private _zoneController = <ZoneController>{};

  /** Retrieve static banner controller. */
  get bannerController() {
    return this._bannerController;
  }

  /** Retrieve static building controller. */
  get buildingController() {
    return this._buildingController;
  }

  /** Retrieve static faction controller. */
  get factionController() {
    return this._factionController;
  }

  /** Retrieve class monitoring service. */
  get monitor() {
    return this._monitor;
  }

  /** Retrieve static research controller. */
  get researchController() {
    return this._researchController;
  }

  /** Retrieve static unit controller. */
  get unitController() {
    return this._unitController;
  }

  /** Retrieve static zone controller. */
  get zoneController() {
    return this._zoneController;
  } 

  constructor(private _staticRepositories: StaticRepositoryService['allRepositories']) {
    this._setupControllers();
  }

  /**
   * Set up all static controllers.
   * @param staticRepositories Static repositories.
   */
  private _setupControllers(
    staticRepositories = this._staticRepositories
  ) {
    this._monitor.log(logType.pending, 'Setting up static controllers...');

    this._bannerController = new BannerController(
      <BannerRepository>staticRepositories.find(r => r.name === 'banner')?.repo,
    );
    this._buildingController = new BuildingController(
      <BuildingRepository>staticRepositories.find(r => r.name === 'building')?.repo,
    );
    this._factionController = new FactionController(
      <FactionRepository>staticRepositories.find(r => r.name === 'faction')?.repo,
    );
    this._researchController = new ResearchController(
      <ResearchRepository>staticRepositories.find(r => r.name === 'research')?.repo,
    );
    this._unitController = new UnitController(
      <UnitRepository>staticRepositories.find(r => r.name === 'unit')?.repo,
    );
    this._zoneController = new ZoneController(
      <ZoneRepository>staticRepositories.find(r => r.name === 'zone')?.repo,
    );

    this._monitor.log(logType.pass, 'Set up static controllers');
  }
}