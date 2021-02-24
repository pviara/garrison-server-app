import LoggerService from '../../config/services/logger/logger.service';
import { ELogType as logType } from '../../config/models/log/log.model';

import { Connection } from 'mongoose';

import { IResearchModel } from '../../config/models/data/static/research/research.types';

/**
 * Handle interactions with research static documents from database static.
 */
export default class ResearchRepository {
  private _logger = new LoggerService(this.constructor.name);

  private _model = <IResearchModel>{};

  constructor(private _connection: Connection) {
    this._logger.log(logType.pending, 'Initializing research repo...');
    this._model = <IResearchModel>this._connection?.model('research');
    this._logger.log(logType.pass, 'Initialized research repo');
  }

  async getAll() {
    return await this._model.find({});
  }

  async findByCode(code: string) {
    return await this._model.findByCode(code);
  }
}