import LoggerService from '../../../config/services/logger/logger.service';
import { ELogType as logType } from '../../../config/models/log/log.model';

import { Connection } from 'mongoose';

import { IFactionModel } from '../../../config/models/data/static/faction/faction.types';

/**
 * Handle interactions with faction static documents from database statics.
 */
export default class FactionRepository {
  private _logger = new LoggerService(this.constructor.name);

  private _model = <IFactionModel>{};

  constructor(private _connection: Connection) {
    this._logger.log(logType.pending, 'Initializing faction repo...');
    this._model = <IFactionModel>this._connection?.model('faction');
    this._logger.log(logType.pass, 'Initialized faction repo');
  }

  async findByCode(code: string) {
    return await this._model.findByCode(code);
  }
}