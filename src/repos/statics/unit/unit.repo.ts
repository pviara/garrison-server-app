import LoggerService from '../../../config/services/logger/logger.service';
import { ELogType as logType } from '../../../config/models/log/log.model';

import { Connection } from 'mongoose';

import { IUnitModel } from '../../../config/models/data/static/unit/unit.types';

/**
 * Handle interactions with unit static documents from database statics.
 */
export default class UnitRepository {
  private _logger = new LoggerService(this.constructor.name);

  private _model = <IUnitModel>{};

  constructor(private _connection: Connection) {
    this._logger.log(logType.pending, 'Initializing building repo...');
    this._model = <IUnitModel>this._connection?.model('unit');
    this._logger.log(logType.pass, 'Initialized building repo');
  }

  async getAll() {
    return await this._model.find({});
  }

  async findByCode(code: string) {
    return await this._model.findByCode(code);
  }
}