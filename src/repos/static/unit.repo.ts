import MonitoringService from '../../config/services/monitoring/monitoring.service';
import { ELogType as logType } from '../../config/models/log/log.model';

import { Connection } from 'mongoose';

import { IUnitModel } from '../../config/models/data/static/unit/unit.types';

/**
 * Handle interactions with unit static documents from database static.
 */
export default class UnitRepository {
  private _monitor = new MonitoringService(this.constructor.name);

  private _model = <IUnitModel>{};

  constructor(private _connection: Connection) {
    this._monitor.log(logType.pending, 'Initializing building repo...');
    this._model = <IUnitModel>this._connection?.model('unit');
    this._monitor.log(logType.pass, 'Initialized building repo');
  }

  async getAll() {
    return await this._model.find({});
  }

  async findByCode(code: string) {
    return await this._model.findByCode(code);
  }
}