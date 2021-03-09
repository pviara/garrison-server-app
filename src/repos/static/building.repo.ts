import ErrorHandler from '../../config/models/error/error-handler.model';

import {
  ELogType as logType
} from '../../config/models/log/log.model';
import MonitoringService from '../../config/services/monitoring/monitoring.service'

import {
  IBuildingDocument,
  IBuildingModel
} from '../../config/models/data/static/building/building.types';

/**
 * Handle interactions with building static documents from database static.
 */
export default class BuildingRepository {
  private _monitor = new MonitoringService(this.constructor.name);

  constructor(private _model: IBuildingModel) {
    this._monitor.log(logType.pass, 'Initialized building repository');
  }

  /**
   * Get all buildings from database.
   * @returns An array of IBuildingDocument.
   */
  async getAll() {
    return await this._model.find({});
  }

  /**
   * Find a building by its code.
   * @param code Given code.
   * @param strict Sets whether an error is thrown when no building is found.
   * @returns Either an IBuildingDocument or (maybe) null if strict mode is set to false.
   */
  async findByCode(code: string, strict?: true): Promise<IBuildingDocument>;
  async findByCode(code: string, strict: false): Promise<IBuildingDocument | null>;
  async findByCode(code: string, strict?: boolean) {
    const result = await this._model.findByCode(code);
    if (!result && strict) throw new ErrorHandler(404, `Building with code '${code}' couldn't be found.`);

    return result as IBuildingDocument;
  }
}