import ErrorHandler from '../../config/models/error/error-handler.model';

import {
  ELogType as logType
} from '../../config/models/log/log.model';
import MonitoringService from '../../config/services/monitoring/monitoring.service'

import {
  IFactionDocument,
  IFactionModel
} from '../../config/models/data/static/faction/faction.types';

/**
 * Handle interactions with faction static documents from database static.
 */
export default class FactionRepository {
  private _monitor = new MonitoringService(this.constructor.name);

  constructor(private _model: IFactionModel) {
    this._monitor.log(logType.pass, 'Initialized faction repository');
  }

  /**
   * Get all factions from database.
   * @returns An array of IFactionDocument.
   */
  async getAll() {
    return await this._model.find({});
  }

  /**
   * Find a faction by its code.
   * @param code Given code.
   * @param strict Sets whether an error is thrown when no faction is found.
   * @returns Either an IFactionDocument or (maybe) null if strict mode is set to false.
   */
  async findByCode(code: string, strict?: true): Promise<IFactionDocument>;
  async findByCode(code: string, strict: false): Promise<IFactionDocument | null>;
  async findByCode(code: string, strict?: boolean) {
    const result = await this._model.findByCode(code);
    if (!result && strict) throw new ErrorHandler(404, `Faction with code '${code}' couldn't be found.`);

    return result as IFactionDocument;
  }
}