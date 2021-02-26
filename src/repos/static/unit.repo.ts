import { ELogType as logType } from '../../config/models/log/log.model';
import MonitoringService from '../../config/services/monitoring/monitoring.service';

import { IUnitModel } from '../../config/models/data/static/unit/unit.types';

/**
 * Handle interactions with unit static documents from database static.
 */
export default class UnitRepository {
  private _monitor = new MonitoringService(this.constructor.name);

  constructor(private _model: IUnitModel) {
    this._monitor.log(logType.pass, 'Initialized unit repository');
  }

  async getAll() {
    return await this._model.find({});
  }

  async findByCode(code: string) {
    return await this._model.findByCode(code);
  }
}