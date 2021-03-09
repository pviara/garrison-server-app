import ErrorHandler from '../../config/models/error/error-handler.model';

import {
  ELogType as logType
} from '../../config/models/log/log.model';
import MonitoringService from '../../config/services/monitoring/monitoring.service'

import {
  IZoneDocument,
  IZoneModel
} from '../../config/models/data/static/zone/zone.types';

export default class ZoneRepository {
  private _monitor = new MonitoringService(this.constructor.name);

  constructor(private _model: IZoneModel) {
    this._monitor.log(logType.pass, 'Initialized zone repository');
  }

  /**
   * Get all zones from database.
   * @returns An array of IZoneDocument.
   */
  async getAll() {
    return await this._model.find({});
  }

  /**
   * Find a zone by its code.
   * @param code Given code.
   * @param strict Sets whether an error is thrown when no zone is found.
   * @returns Either an IZoneDocument or (maybe) null if strict mode is set to false.
   */
  async findByCode(code: string, strict?: true): Promise<IZoneDocument>;
  async findByCode(code: string, strict: false): Promise<IZoneDocument | null>;
  async findByCode(code: string, strict?: boolean) {
    const result = await this._model.findByCode(code);
    if (!result && strict) throw new ErrorHandler(404, `Zone with code '${code}' couldn't be found.`);

    return result as IZoneDocument;
  }
}