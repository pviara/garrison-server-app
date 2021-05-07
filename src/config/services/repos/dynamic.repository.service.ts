import ErrorHandler from '../../models/error/error-handler.model';

import { ELogType as logType } from '../../../config/models/log/log.model';
import IMonitored from '../../models/IMonitored';
import MonitoringService from '../monitoring/monitoring.service';

import {
  Document,
  Model
} from 'mongoose';

import { ICharacterModel } from '../../models/data/dynamic/character/character.types';
import { IGarrisonModel } from '../../models/data/dynamic/garrison/garrison.types';
import { IUserModel } from '../../models/data/dynamic/user/user.types';

import { ModelRetrievingCallback } from './repository.service';

import BannerRepository from '../../../repos/static/banner.repo';
import BuildingRepository from '../../../repos/static/building.repo';
import CharacterRepository from '../../../repos/dynamic/character/character.repo';
import FactionRepository from '../../../repos/static/faction.repo';
import GarrisonRepository from '../../../repos/dynamic/garrison/garrison.repo';
import UnitRepository from '../../../repos/static/unit.repo';
import UserRepository from '../../../repos/dynamic/user/user.repo';
import ZoneRepository from '../../../repos/static/zone.repo';

import StaticRepositoryService from './static.repository.service';
import ResearchRepository from '../../../repos/static/research.repo';

export default class DynamicRepositoryService implements IMonitored {
  private _monitor = new MonitoringService(this.constructor.name);
  
  private _characterRepository = <CharacterRepository>{};
  private _garrisonRepository = <GarrisonRepository>{};
  private _userRepository = <UserRepository>{};
  
  /** Retrieve all dynamic repositories. */
  get allRepositories() {
    return [
      {
        name: 'character',
        repo: this._characterRepository
      },
      {
        name: 'garrison',
        repo: this._garrisonRepository
      },
      {
        name: 'user',
        repo: this._userRepository
      }
    ]
  }
  
  /** Retrieve dynamic character repository. */
  get characterRepository() {
    return this._characterRepository;
  }
  
  /** Retrieve dynamic garrison repository. */
  get garrisonRepository() {
    return this._garrisonRepository;
  }
  
  /** Retrieve class monitoring service. */
  get monitor() {
    return this._monitor;
  }
  
  /** Retrieve dynamic user repository. */
  get userRepository() {
    return this._userRepository;
  }
  
  constructor(
    private _findModelByName: ModelRetrievingCallback,
    private _dynamicModels: Model<Document, {}>[],
    private _staticRepositories: StaticRepositoryService['allRepositories']
  ) {
    this._setupRepositories();
  }

  /**
   * Set up all dynamic repositories.
   * @param findModelByName Retrieve a model by its name from an array of models.
   * @param staticModels Dynamic models.
   * @param staticModels Static repositories.
   */
  private _setupRepositories(
    findModelByName = this._findModelByName,
    dynamicModels = this._dynamicModels,
    staticRepositories = this._staticRepositories
  ) {
    this._monitor.log(logType.pending, 'Setting up dynamic repositories...');

    // --------------------------------------------------------------------------
    // retrieve user model and init user repository
    let model = findModelByName('user', dynamicModels);
    if (!model) {
      const message = 'Couldn\'t find user model inside given models';
      this._monitor.log(logType.fail, message);
      throw new ErrorHandler(500, message);
    }
    this._userRepository = new UserRepository(<IUserModel>model);

    // --------------------------------------------------------------------------
    // retrieve character model and init character repository
    model = findModelByName('character', dynamicModels);
    if (!model) {
      const message = 'Couldn\'t find character model inside given models';
      this._monitor.log(logType.fail, message);
      throw new ErrorHandler(500, message);
    }
    this._characterRepository = new CharacterRepository(
      <ICharacterModel>model,
      <BannerRepository>staticRepositories.find(r => r.name === 'banner')?.repo,
      <FactionRepository>staticRepositories.find(r => r.name === 'faction')?.repo,
      this.userRepository
    );

    // --------------------------------------------------------------------------
    // retrieve garrison model and init garrison repository
    model = findModelByName('garrison', dynamicModels);
    if (!model) {
      const message = 'Couldn\'t find garrison model inside given models';
      this._monitor.log(logType.fail, message);
      throw new ErrorHandler(500, message);
    }
    this._garrisonRepository = new GarrisonRepository(
      <IGarrisonModel>model,
      <BuildingRepository>staticRepositories.find(r => r.name === 'building')?.repo,
      this.characterRepository,
      <ResearchRepository>staticRepositories.find(r => r.name === 'research')?.repo,
      <UnitRepository>staticRepositories.find(r => r.name === 'unit')?.repo,
      this.userRepository,
      <ZoneRepository>staticRepositories.find(r => r.name === 'zone')?.repo,
    );
    
    // --------------------------------------------------------------------------
    this._monitor.log(logType.pass, 'Set up dynamic repositories');
  }
}