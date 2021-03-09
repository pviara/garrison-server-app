import ErrorHandler from '../../config/models/error/error-handler.model';

import {
  ELogType as logType
} from '../../config/models/log/log.model';
import MonitoringService from '../../config/services/monitoring/monitoring.service';

import {
  IUnitDocument,
  IUnitModel
} from '../../config/models/data/static/unit/unit.types';

/**
 * Handle interactions with unit static documents from database static.
 */
export default class UnitRepository {
  private _monitor = new MonitoringService(this.constructor.name);

  constructor(private _model: IUnitModel) {
    this._monitor.log(logType.pass, 'Initialized unit repository');
  }

  /**
   * Get all units from database.
   * @returns An array of IUnitDocument.
   */
  async getAll() {
    return await this._model.find({});
  }

  /**
   * Find a unit by its code.
   * @param code Given code.
   * @param strict Sets whether an error is thrown when no unit is found.
   * @returns Either an IUnitDocument or (maybe) null if strict mode is set to false.
   */
  async findByCode(code: string, strict?: true): Promise<IUnitDocument>;
  async findByCode(code: string, strict: false): Promise<IUnitDocument | null>;
  async findByCode(code: string, strict?: boolean) {
    const result = await this._model.findByCode(code);
    if (!result && strict) throw new ErrorHandler(404, `Unit with code '${code}' couldn't be found.`);

    return result as IUnitDocument;
  }
}