import ErrorHandler from '../../../config/models/error/error-handler.model';

import LoggerService from '../../../config/services/logger/logger.service';
import { ELogType as logType } from '../../../config/models/log/log.model';

import { Connection } from 'mongoose';
import { ObjectId } from 'mongodb';

import { IGarrisonModel } from '../../../config/models/data/garrison/garrison.types';
import IGarrisonCreate from '../../../config/models/data/garrison/payloads/IGarrisonCreate';

import { IZone } from '../../../config/models/data/static/zone/zone.types'

import CharacterRepository from '../character/character.repo';
import ZoneRepository from '../../statics/zone/zone.repo';

export default class GarrisonRepository {
  private _logger = new LoggerService(this.constructor.name);

  private _model = <IGarrisonModel>{};

  constructor(
    private _connection: Connection,
    private _characterRepo: CharacterRepository,
    private _zoneRepo: ZoneRepository
  ) {
    this._logger.log(logType.pending, 'Initializing garrison repo...');
    this._model = <IGarrisonModel>this._connection?.model('garrison');
    this._logger.log(logType.pass, 'Initialized garrison repo');
  }

  async findById(id: ObjectId) {
    return await this._model.findById(id);
  }

  async getFromCharacter(characterId: ObjectId) {
    return await this._model.find({ characterId });
  }

  async create(payload: IGarrisonCreate) {
    const characterGarrisons = await this.getFromCharacter(payload.characterId);
    const existing = characterGarrisons
      ?.some(g => g.name.toLowerCase() === payload.name.toLowerCase());
    if (existing) throw new ErrorHandler(409, 'Already existing garrison.');

    // check on character existence
    const character = await this._characterRepo.findById(payload.characterId);
    if (!character) throw new ErrorHandler(404, 'Character couldn\'t be found.');

    // check on zone existence
    const zone = await this._zoneRepo.findByCode(payload.zone);
    if (!zone) throw new ErrorHandler(404, 'Zone couldn\'t be found.');

    // check if zone is compliant with character's faction
    if (!((<IZone>zone).side === character.side.faction))
      throw new ErrorHandler(400, 'Selected zone is not compliant with character\'s faction.');

    // create the garrison with default values
    return this._model.create({
      characterId: payload.characterId,
      name: payload.name,
      zone: payload.zone,
      resources: {
        gold: 625,
        wood: 320,
        food: 3,
        plot: 32
      },
      instances: {
        buildings: [],
        researches: [],
        units: [
          {
            code: 'peasant',
            quantity: 3,
            state: {
              assignments: []
            }
          }
        ]
      }
    });
  }
}