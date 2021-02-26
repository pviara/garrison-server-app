import { ELogType as logType } from '../../config/models/log/log.model';
import MonitoringService from '../../config/services/monitoring/monitoring.service'

import { IBuildingModel } from '../../config/models/data/static/building/building.types';

/**
 * Handle interactions with building static documents from database static.
 */
export default class BuildingRepository {
  private _monitor = new MonitoringService(this.constructor.name);

  constructor(private _model: IBuildingModel) {
    this._monitor.log(logType.pass, 'Initialized building repository');
  }

  async getAll() {
    return await this._model.find({});
  }

  async findByCode(code: string) {
    return await this._model.findByCode(code);
  }
}