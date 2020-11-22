import ErrorHandler from '../../../config/models/error/error-handler.model';

import LoggerService from '../../../config/services/logger/logger.service';
import { ELogType as logType } from '../../../config/models/log/log.model';

import { Connection } from 'mongoose';
import { ObjectId } from 'mongodb';

import { ICharacterModel } from '../../../config/models/data/character/character.types';
import ICharacterCreate from '../../../config/models/data/character/payloads/ICharacterCreate';

import BannerRepository from '../../statics/banner/banner.repo';
import FactionRepository from '../../statics/faction/faction.repo';
import UserRepository from '../user/user.repo';

/**
 * Handle interactions with character documents from database dynamic.
 */
export default class CharacterRepository {
  private _logger = new LoggerService(this.constructor.name);

  private _model = <ICharacterModel>{};

  constructor(
    private _connection: Connection,
    private _bannerRepo: BannerRepository,
    private _factionRepo: FactionRepository,
    private _userRepo: UserRepository
  ) {
    this._logger.log(logType.pending, 'Initializing character repo...');
    this._model = <ICharacterModel>this._connection?.model('character');
    this._logger.log(logType.pass, 'Initialized character repo');
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