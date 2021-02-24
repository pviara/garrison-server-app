import MonitoringService from '../../config/services/monitoring/monitoring.service'
import { ELogType as logType } from '../../config/models/log/log.model';

import { Connection } from 'mongoose';

import { IFactionModel } from '../../config/models/data/static/faction/faction.types';

/**
 * Handle interactions with faction static documents from database static.
 */
export default class FactionRepository {
  private _monitor = new MonitoringService(this.constructor.name);

  private _model = <IFactionModel>{};

  constructor(private _connection: Connection) {
    this._monitor.log(logType.pending, 'Initializing faction repo...');
    this._model = <IFactionModel>this._connection?.model('faction');
    this._monitor.log(logType.pass, 'Initialized faction repo');
  }

  async getAll() {
    return await this._model.find({});
  }

  async findByCode(code: string) {
    return await this._model.findByCode(code);
  }
}