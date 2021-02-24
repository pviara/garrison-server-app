import MonitoringService from '../../config/services/monitoring/monitoring.service'
import { ELogType as logType } from '../../config/models/log/log.model';

import { Connection } from 'mongoose';

import { IBuildingModel } from '../../config/models/data/static/building/building.types';

/**
 * Handle interactions with building static documents from database static.
 */
export default class BuildingRepository {
  private _monitor = new MonitoringService(this.constructor.name);

  private _model = <IBuildingModel>{};

  constructor(private _connection: Connection) {
    this._monitor.log(logType.pending, 'Initializing building repo...');
    this._model = <IBuildingModel>this._connection?.model('building');
    this._monitor.log(logType.pass, 'Initialized building repo');
  }

  async getAll() {
    return await this._model.find({});
  }

  async findByCode(code: string) {
    return await this._model.findByCode(code);
  }
}