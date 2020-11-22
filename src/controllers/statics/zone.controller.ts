import { Request, Response, NextFunction } from 'express';

import ZoneRepository from '../../repos/statics/zone/zone.repo';

import helper from '../../utils/helper.utils';

import { IZoneDocument } from '../../config/models/data/static/zone/zone.types';

export default class ZoneController {
  constructor(private _repo: ZoneRepository) {}

  /**
   * Get all zones or one specific zone from statics database.
   * @param req Recevied client request.
   * @param res Response to send.
   * @param next Next express function (lifecycle).
   */
  async get(req: Request, res: Response, next: NextFunction) {
    return (helper.isObjectEmpty(req.query) || !req.query.code)
      ? await this._repo.getAll()
      : <IZoneDocument>await this._repo.findByCode(req.query.code as string);
  }
}