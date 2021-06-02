import ErrorHandler from '../../../config/models/error/error-handler.model';

import {
  ELogType as logType
} from '../../../config/models/log/log.model';
import IMonitored from '../../../config/models/IMonitored';
import MonitoringService from '../../../config/services/monitoring/monitoring.service';

import {
  ObjectId
} from 'mongodb';

import {
  ICharacterDocument,
  ICharacterModel
} from '../../../config/models/data/dynamic/character/character.types';
import ICharacterCreate from '../../../config/models/data/dynamic/character/payloads/ICharacterCreate';

import BannerRepository from '../../static/banner.repo';
import FactionRepository from '../../static/faction.repo';
import UserRepository from '../user/user.repo';

import helper from '../../../utils/helper.utils';

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

  /**
   * Find a character by its id.
   * @param id Given ObjectId.
   * @param strict Sets whether an error is thrown when no character is found.
   * @returns Either an ICharacterDocument or (maybe) null if strict mode is set to false.
   */
  async findById(id: ObjectId, strict ? : true): Promise < ICharacterDocument > ;
  async findById(id: ObjectId, strict: false): Promise < ICharacterDocument | null > ;
  async findById(id: ObjectId, strict ? : boolean) {
    const result = await this._model.findById(id);
    if (!result && strict) throw new ErrorHandler(404, `Character with characterId ${id} couldn't be found.`);

    return result;
  }

  /**
   * Get a character from a user's id.
   * @param userId Given ObjectId.
   * @param strict Sets whether an error is thrown when no character is found.
   * @returns Either an ICharacterDocument or (maybe) null if strict mode is set to false.
   */
  async getFromUser(userId: ObjectId, strict ? : true): Promise<ICharacterDocument[]> ;
  async getFromUser(userId: ObjectId, strict: false): Promise<ICharacterDocument[] | null> ;
  async getFromUser(userId: ObjectId, strict = true) {
    const result = await this._model.find({
      userId
    });
    if (result.length === 0 && strict) throw new ErrorHandler(404, `No character from userId ${userId} could be found.`);

    return result;
  }

  /**
   * Create and save a new character in database.
   * @param payload @see ICharacterCreate
   */
  async create(payload: ICharacterCreate) {
    const userCharacters = await this.getFromUser(payload.userId, false);
    const sameCharName = userCharacters
      ?.some(character => helper.areSameString(character.name, payload.name));
    
    if (sameCharName) {
      throw new ErrorHandler(409, `Already existing character with name '${payload.name}'.`);
    }

    // check on user existence
    await this._userRepo.findById(payload.userId);

    // check on faction existence
    await this._factionRepo.findByCode(payload.side.faction);

    // check on banner existence
    await this._bannerRepo.findByCode(payload.side.banner);

    // create character
    return this._model.create({
      userId: payload.userId,
      name: payload.name,
      side: payload.side
    });
  }
}