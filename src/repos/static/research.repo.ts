import ErrorHandler from '../../config/models/error/error-handler.model';

import {
  ELogType as logType
} from '../../config/models/log/log.model';
import MonitoringService from '../../config/services/monitoring/monitoring.service'

import {
  IResearchDocument,
  IResearchModel
} from '../../config/models/data/static/research/research.types';

/**
 * Handle interactions with research static documents from database static.
 */
export default class ResearchRepository {
  private _monitor = new MonitoringService(this.constructor.name);

  constructor(private _model: IResearchModel) {
    this._monitor.log(logType.pass, 'Initialized research repository');
  }

  /**
   * Get all researches from database.
   * @returns An array of IResearchDocument.
   */
  async getAll() {
    return await this._model.find({});
  }

  /**
   * Find a research by its code.
   * @param code Given code.
   * @param strict Sets whether an error is thrown when no research is found.
   * @returns Either an IResearchDocument or (maybe) null if strict mode is set to false.
   */
  async findByCode(code: string, strict?: true): Promise<IResearchDocument>;
  async findByCode(code: string, strict: false): Promise<IResearchDocument | null>;
  async findByCode(code: string, strict?: boolean) {
    const result = await this._model.findByCode(code);
    if (!result && strict) throw new ErrorHandler(404, `Research with code '${code}' couldn't be found.`);

    return result as IResearchDocument;
  }
}