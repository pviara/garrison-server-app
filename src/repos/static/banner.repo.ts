import LoggerService from '../../config/services/logger/logger.service';
import { ELogType as logType } from '../../config/models/log/log.model';

import { Connection } from 'mongoose';

import { IBannerModel } from '../../config/models/data/static/banner/banner.types';

/**
 * Handle interactions with banner static documents from database static.
 */
export default class BannerRepository {
  private _logger = new LoggerService(this.constructor.name);

  private _model = <IBannerModel>{};

  constructor(private _connection: Connection) {
    this._logger.log(logType.pending, 'Initializing banner repo...');
    this._model = <IBannerModel>this._connection?.model('banner');
    this._logger.log(logType.pass, 'Initialized banner repo');
  }

  async getAll() {
    return await this._model.find({});
  }

  async findByCode(code: string) {
    return await this._model.findByCode(code);
  }
}