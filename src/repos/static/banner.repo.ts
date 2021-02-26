import { ELogType as logType } from '../../config/models/log/log.model';
import MonitoringService from '../../config/services/monitoring/monitoring.service'

import { IBannerModel } from '../../config/models/data/static/banner/banner.types';

/**
 * Handle interactions with banner static documents from database static.
 */
export default class BannerRepository {
  private _monitor = new MonitoringService(this.constructor.name);

  constructor(private _model: IBannerModel) {
    this._monitor.log(logType.pass, 'Initialized banner repository');
  }

  async getAll() {
    return await this._model.find({});
  }

  async findByCode(code: string) {
    return await this._model.findByCode(code);
  }
}