import { Request, Response, NextFunction } from 'express';

import FactionRepository from '../../repos/statics/faction/faction.repo';

import helper from '../../utils/helper.utils';

import { IBannerDocument } from '../../config/models/data/static/banner/banner.types';

export default class FactionController {
  constructor(private _repo: FactionRepository) {}

  /**
   * Get all factions or one specific faction from statics database.
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