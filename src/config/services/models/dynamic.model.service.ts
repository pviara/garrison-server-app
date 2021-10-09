import { ELogType as logType } from '../../models/log/log.model';
import IMonitored from '../../models/IMonitored';
import MonitoringService from '../monitoring/monitoring.service';

import { Connection } from 'mongoose';

import characterSchema from '../../models/data/dynamic/character/character.schema';
import garrisonSchema from '../../models/data/dynamic/garrison/garrison.schema';
import recordSchema from '../../models/data/dynamic/record/record.schema';
import userSchema from '../../models/data/dynamic/user/user.schema';

import {
  ICharacterDocument,
  ICharacterModel
} from '../../models/data/dynamic/character/character.types';
import {
  IGarrisonDocument,
  IGarrisonModel
} from '../../models/data/dynamic/garrison/garrison.types';
import {
  IRecordDocument,
  IRecordModel
} from '../../models/data/dynamic/record/record.types';

import {
  IUserDocument,
  IUserModel
} from '../../models/data/dynamic/user/user.types';
/**
 * Mongoose dynamic models service.
 */
export default class DynamicModelService implements IMonitored {
  private _monitor = new MonitoringService(this.constructor.name);

  /** Retrieve all dynamic models. */
  get models() {
    return [
      this._connection.model('character'),
      this._connection.model('garrison'),
      this._connection.model('record'),
      this._connection.model('user')
    ]
  }
  
  /** Retrieve class monitoring service. */
  get monitor() {
    return this._monitor;
  }

  constructor(private _connection: Connection) {}

  /**
   * Setup dynamic models.
   * @param connection Given dynamic connection.
   */
  async setupModels(connection = this._connection) {
    this._monitor.log(logType.pending, 'Initializing mongoose dynamic models...');

    connection?.model<ICharacterDocument>('character', characterSchema) as ICharacterModel;
    connection?.model<IGarrisonDocument>('garrison', garrisonSchema) as IGarrisonModel;
    connection?.model<IRecordDocument>('record', recordSchema) as IRecordModel;
    connection?.model<IUserDocument>('user', userSchema) as IUserModel;

    connection
      .modelNames()
      .forEach(name => {
        this.monitor.log(logType.pass, `Initialized mongoose dynamic model '${name}'`);
      });
  }
}