import { ELogType as logType } from '../../config/models/log/log.model';
import MonitoringService from '../../config/services/monitoring/monitoring.service'

import { IFactionModel } from '../../config/models/data/static/faction/faction.types';

/**
 * Handle interactions with faction static documents from database static.
 */
export default class FactionRepository {
  private _monitor = new MonitoringService(this.constructor.name);

  constructor(private _model: IFactionModel) {
    this._monitor.log(logType.pass, 'Initialized faction repository');
  }

  async getAll() {
    return await this._model.find({});
  }

  async findByCode(code: string) {
    return await this._model.findByCode(code);
  }
}