import MonitoringService from '../../config/services/monitoring/monitoring.service'
import { ELogType as logType } from '../../config/models/log/log.model';

import { Connection } from 'mongoose';

import { IZoneModel } from '../../config/models/data/static/zone/zone.types';

export default class ZoneRepository {
  private _monitor = new MonitoringService(this.constructor.name);
  
  constructor(private _model: IZoneModel) {
    this._monitor.log(logType.pass, 'Initialized zone repository');
  }

  async getAll() {
    return await this._model.find({});
  }

  async findByCode(code: string) {
    return await this._model.findByCode(code);
  }
}