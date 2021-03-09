import {
  ELogType as logType
} from '../../config/models/log/log.model';
import MonitoringService from '../../config/services/monitoring/monitoring.service'

import {
  IBannerDocument,
  IBannerModel
} from '../../config/models/data/static/banner/banner.types';
import ErrorHandler from '../../config/models/error/error-handler.model';

/**
 * Handle interactions with banner static documents from database static.
 */
export default class BannerRepository {
  private _monitor = new MonitoringService(this.constructor.name);

  constructor(private _model: IBannerModel) {
    this._monitor.log(logType.pass, 'Initialized banner repository');
  }

  /**
   * Get all banners from database.
   * @returns An array of IBannerDocument.
   */
  async getAll() {
    return await this._model.find({});
  }

  /**
   * Find a banner by its code.
   * @param code Given code.
   * @param strict Sets whether an error is thrown when no banner is found.
   * @returns Either an IBannerDocument or (maybe) null if strict mode is set to false.
   */
  async findByCode(code: string, strict?: true): Promise<IBannerDocument>;
  async findByCode(code: string, strict: false): Promise<IBannerDocument | null>;
  async findByCode(code: string, strict?: boolean) {
    const result = await this._model.findByCode(code);
    if (!result && strict) throw new ErrorHandler(404, `Banner with code '${code}' couldn't be found.`);

    return result as IBannerDocument;
  }
}