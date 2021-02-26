import { ELogType as logType } from '../../config/models/log/log.model';
import MonitoringService from '../../config/services/monitoring/monitoring.service'

import { IResearchModel } from '../../config/models/data/static/research/research.types';

/**
 * Handle interactions with research static documents from database static.
 */
export default class ResearchRepository {
  private _monitor = new MonitoringService(this.constructor.name);

  constructor(private _model: IResearchModel) {
    this._monitor.log(logType.pass, 'Initialized research repository');
  }

  async getAll() {
    return await this._model.find({});
  }

  async findByCode(code: string) {
    return await this._model.findByCode(code);
  }
}