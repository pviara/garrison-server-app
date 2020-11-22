import { Request, Response, NextFunction } from 'express';

import BannerRepository from '../../repos/statics/banner/banner.repo';

import helper from '../../utils/helper.utils';

import { IBannerDocument } from '../../config/models/data/static/banner/banner.types';

export default class BannerController {
  constructor(private _repo: BannerRepository) {}

  /**
   * Get all banners or one specific banner from statics database.
   * @param req Recevied client request.
   * @param res Response to send.
   * @param next Next express function (lifecycle).
   */
  async get(req: Request, res: Response, next: NextFunction) {
    return (helper.isObjectEmpty(req.query) || !req.query.code)
      ? await this._repo.getAll()
      : <IBannerDocument>await this._repo.findByCode(req.query.code as string);
  }
}