import {
  ELogType as logType
} from '../../../config/models/log/log.model';
import IMonitored from "../../../config/models/IMonitored";
import {
  IRecord,
  IRecordDocument,
  IRecordModel
} from "../../../config/models/data/dynamic/record/record.types";
import MonitoringService from "../../../config/services/monitoring/monitoring.service";
import { ObjectId } from 'mongodb';
import ErrorHandler from '../../../config/models/error/error-handler.model';
import _h from '../../../utils/helper.utils';

export default class RegisterRepository implements IMonitored {
  private _monitor = new MonitoringService(this.constructor.name);

  /** Retrieve class monitoring service. */
  get monitor() {
    return this._monitor;
  }

  constructor(private _model: IRecordModel) {
    this._monitor.log(logType.pass, 'Initialized record repository');
  }

  /**
   * Find all records from a specific garrison.
   * @param garrisonId Given Garrison's id.
   * @param strict Sets whether an error is thrown when no record is found.
   * @returns Either an IRecordDocument or (maybe) null if strict mode is set to false.
   */
  async getFromGarrison(garrisonId: ObjectId, strict?: true): Promise<IRecordDocument[]> ;
  async getFromGarrison(garrisonId: ObjectId, strict: false): Promise<IRecordDocument[] | null> ;
  async getFromGarrison(garrisonId: ObjectId, strict: boolean = true) {
    const result = await this._model.find({
      garrisonId
    });
    if (result.length === 0 && strict) {
      throw new ErrorHandler(404, `No record from garrisonId '${garrisonId}' could be found.`);
    }

    return result;
  }

  async create(record: IRecord) {
    if (record.quantity && record.quantity < 0) {
      throw new ErrorHandler(412, 'At least one entity must be concerned by the recorded action.');
    }
    if ((record.entity === 'building' || record.entity === 'research') && record.quantity) {
      throw new ErrorHandler(412, 'An action about a building/research has nothing to do with any quantity.');
    }
    if (!_h.hasPast(record.moment)) {
      throw new ErrorHandler(412, 'An action must have passed.');
    }
    return await this._model.create(record);
  }
}