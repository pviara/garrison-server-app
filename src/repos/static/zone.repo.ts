import LoggerService from '../../config/services/logger/logger.service';
import { ELogType as logType } from '../../config/models/log/log.model';

import { Connection } from 'mongoose';

import { IZoneModel } from '../../config/models/data/static/zone/zone.types';

export default class ZoneRepository {
  private _logger = new LoggerService(this.constructor.name);

  private _model = <IZoneModel>{};
  
  constructor(private _connection: Connection) {
    this._logger.log(logType.pending, 'Initializing zone repo...');
    this._model = <IZoneModel>this._connection?.model('zone');
    this._logger.log(logType.pass, 'Initialized zone repo');
  }

  async getAll() {
    return await this._model.find({});
  }

  async findByCode(code: string) {
    return await this._model.findByCode(code);
  }
}