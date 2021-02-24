import { Request, Response, NextFunction } from 'express';

import BannerRepository from '../../repos/static/banner.repo';
import { IBannerDocument } from '../../config/models/data/static/banner/banner.types';

import helper from '../../utils/helper.utils';

import ErrorHandler from '../../config/models/error/error-handler.model';

export default class BannerController {
  private _banners: IBannerDocument[] = [];
  
  constructor(private _repo: BannerRepository) {}

  /**
   * Get all banners from statics database.
   * @param req Recevied client request.
   * @param res Response to send.
   * @param next Next express function (lifecycle).
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    // look for the banner in cache data
    if (this._banners.length > 0) return this._banners;

    // try to fetch it from statics
    const result = <IBannerDocument[]>await this._repo.getAll();
    if (!result) throw new ErrorHandler(404, 'Not a single banner could be found.');

    // add it to cache data then return it
    this._banners = result;
    return result;
  }

  /**
   * Get a specific banner from statics database.
   * @param req Recevied client request.
   * @param res Response to send.
   * @param next Next express function (lifecycle).
   */
  async get(req: Request, res: Response, next: NextFunction) {
    if (helper.isObjectEmpty(req.params) || !req.params.code)
      throw new ErrorHandler(400, 'Missing code in params.');

    // look for the banner in cache data
    const existing = this._banners.find(b => b?.code === req.params.code);
    if (!existing) {
      // try to fetch it from statics
      const result = <IBannerDocument>await this._repo.findByCode(req.params.code as string);
      if (!result) throw new ErrorHandler(404, `Banner '${req.params.code}' couldn't be found.`);

      // add it to cache data then return it
      this._banners = [...this._banners, result];
      return result;
    }
    return existing;
  }
}