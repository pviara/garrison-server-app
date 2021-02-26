import ErrorHandler from '../../../config/models/error/error-handler.model';

import { ELogType as logType } from '../../../config/models/log/log.model';
import IMonitored from '../../../config/models/IMonitored';
import MonitoringService from '../../../config/services/monitoring/monitoring.service';

import { ObjectId } from 'mongodb';

import { ICharacterModel } from '../../../config/models/data/dynamic/character/character.types';
import ICharacterCreate from '../../../config/models/data/dynamic/character/payloads/ICharacterCreate';

import BannerRepository from '../../static/banner.repo';
import FactionRepository from '../../static/faction.repo';
import UserRepository from '../user/user.repo';

/**
 * Handle interactions with character documents from database dynamic.
 */
export default class CharacterRepository implements IMonitored {
  private _monitor = new MonitoringService(this.constructor.name);

  get monitor() {
    return this._monitor;
  }
  
  constructor(
    private _model: ICharacterModel,
    private _bannerRepo: BannerRepository,
    private _factionRepo: FactionRepository,
    private _userRepo: UserRepository
  ) {
    this._monitor.log(logType.pass, 'Initialized character repository');
  }

  async findById(id: ObjectId) {
    return await this._model.findById(id);
  }

  async getFromUser(userId: ObjectId) {
    return await this._model.findOne({ userId });
  }

  async create(payload: ICharacterCreate) {
    const userCharacter = await this.getFromUser(payload.userId);
    const existing = userCharacter?.name.toLowerCase() === payload.name.toLowerCase();
    if (existing) throw new ErrorHandler(409, 'Already existing character.');

    // check on user existence
    const user = await this._userRepo.findById(payload.userId);
    if (!user) throw new ErrorHandler(404, 'User couldn\'t be found.');

    // check on faction existence
    const faction = await this._factionRepo.findByCode(payload.side.faction);
    if (!faction) throw new ErrorHandler(404, 'Faction couldn\'t be found.');

    // check on banner existence
    const banner = await this._bannerRepo.findByCode(payload.side.banner);
    if (!banner) throw new ErrorHandler(404, 'Banner couldn\'t be found.');

    // create character
    return this._model.create({
      userId: payload.userId,
      name: payload.name,
      side: payload.side
    });
  }
}