import ErrorHandler from '../../models/error/error-handler.model';

import { ELogType as logType } from '../../../config/models/log/log.model';
import IMonitored from '../../models/IMonitored';
import MonitoringService from '../monitoring/monitoring.service';

import {
  Document,
  Model
} from 'mongoose';

import { IBannerModel } from '../../models/data/static/banner/banner.types';
import { IBuildingModel } from '../../models/data/static/building/building.types';
import { IFactionModel } from '../../models/data/static/faction/faction.types';
import { IResearchModel } from '../../models/data/static/research/research.types';
import { IUnitModel } from '../../models/data/static/unit/unit.types';
import { IZoneModel } from '../../models/data/static/zone/zone.types';

import { ModelRetrievingCallback } from './repository.service';

import BannerRepository from '../../../repos/static/banner.repo';
import BuildingRepository from '../../../repos/static/building.repo';
import FactionRepository from '../../../repos/static/faction.repo';
import ResearchRepository from '../../../repos/static/research.repo';
import UnitRepository from '../../../repos/static/unit.repo';
import ZoneRepository from '../../../repos/static/zone.repo';

export default class StaticRepositoryService implements IMonitored {
  private _monitor = new MonitoringService(this.constructor.name);
  
  private _bannerRepository = <BannerRepository>{};
  private _buildingRepository = <BuildingRepository>{};
  private _factionRepository = <FactionRepository>{};
  private _researchRepository = <ResearchRepository>{};
  private _unitRepository = <UnitRepository>{};
  private _zoneRepository = <ZoneRepository>{};

  /** Retrieve all static repositories. */
  get allRepositories() {
    return [
      {
        name: 'banner',
        repo: this._bannerRepository
      },
      {
        name: 'building',
        repo: this._buildingRepository
      },
      {
        name: 'faction',
        repo: this._factionRepository
      },
      {
        name: 'research',
        repo: this._researchRepository
      },
      {
        name: 'unit',
        repo: this._unitRepository
      },
      {
        name: 'zone',
        repo: this._zoneRepository
      }
    ];
  }
  
  /** Retrieve static banner repository. */
  get bannerRepository() {
    return this._bannerRepository;
  }

  /** Retrieve static building repository. */
  get buildingRepository() {
    return this._buildingRepository;
  }

  /** Retrieve static faction repository. */
  get factionRepository() {
    return this._factionRepository;
  }
  
  /** Retrieve class monitoring service. */
  get monitor() {
    return this._monitor;
  }

  /** Retrieve static research repository. */
  get researchRepository() {
    return this._researchRepository;
  }

  /** Retrieve static unit repository. */
  get unitRepository() {
    return this._unitRepository;
  }

  /** Retrieve static zone repository. */
  get zoneRepository() {
    return this._zoneRepository;
  }
  
  constructor(
    private _findModelByName: ModelRetrievingCallback,
    private _staticModels: Model<Document, {}>[]
  ) {
    this.setupRepositories();
  }

  /**
   * Set up all static repositories.
   * @param findModelByName Retrieve a model by its name from an array of models.
   * @param staticModels Static models.
   */
  setupRepositories(
    findModelByName = this._findModelByName,
    staticModels = this._staticModels
  ) {
    this._monitor.log(logType.pending, 'Setting up static repositories...');

    // --------------------------------------------------------------------------
    // retrieve banner model and init banner repository
    let model = findModelByName('banner', staticModels);
    if (!model) {
      const message = 'Couldn\'t find banner model inside given models';
      this._monitor.log(logType.fail, message);
      throw new ErrorHandler(500, message);
    }
    this._bannerRepository = new BannerRepository(<IBannerModel>model);

    // --------------------------------------------------------------------------
    // retrieve building model and init building repository
    model = findModelByName('building', staticModels);
    if (!model) {
      const message = 'Couldn\'t find building model inside given models';
      this._monitor.log(logType.fail, message);
      throw new ErrorHandler(500, message);
    }
    this._buildingRepository = new BuildingRepository(<IBuildingModel>model);

    // --------------------------------------------------------------------------
    // retrieve faction model and init building repository
    model = findModelByName('faction', staticModels);
    if (!model) {
      const message = 'Couldn\'t find faction model inside given models';
      this._monitor.log(logType.fail, message);
      throw new ErrorHandler(500, message);
    }
    this._factionRepository = new FactionRepository(<IFactionModel>model);

    // --------------------------------------------------------------------------
    // retrieve research model and init building repository
    model = findModelByName('research', staticModels);
    if (!model) {
      const message = 'Couldn\'t find research model inside given models';
      this._monitor.log(logType.fail, message);
      throw new ErrorHandler(500, message);
    }
    this._researchRepository = new ResearchRepository(<IResearchModel>model);

    // --------------------------------------------------------------------------
    // retrieve unit model and init building repository
    model = findModelByName('unit', staticModels);
    if (!model) {
      const message = 'Couldn\'t find unit model inside given models';
      this._monitor.log(logType.fail, message);
      throw new ErrorHandler(500, message);
    }
    this._unitRepository = new UnitRepository(<IUnitModel>model);

    // --------------------------------------------------------------------------
    // retrieve zone model and init building repository
    model = findModelByName('zone', staticModels);
    if (!model) {
      const message = 'Couldn\'t find zone model inside given models';
      this._monitor.log(logType.fail, message);
      throw new ErrorHandler(500, message);
    }
    this._zoneRepository= new ZoneRepository(<IZoneModel>model);
    
    // --------------------------------------------------------------------------
    this._monitor.log(logType.pass, 'Set up static repositories');
  }
}