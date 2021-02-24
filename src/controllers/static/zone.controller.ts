import { Request, Response, NextFunction } from 'express';

import ZoneRepository from '../../repos/static/zone.repo';

import helper from '../../utils/helper.utils';

import { IZoneDocument } from '../../config/models/data/static/zone/zone.types';

import ErrorHandler from '../../config/models/error/error-handler.model';

export default class ZoneController {
  private _zones: IZoneDocument[] = [];
  
  constructor(private _repo: ZoneRepository) {}

  /**
   * Get all zones from statics database.
   * @param req Recevied client request.
   * @param res Response to send.
   * @param next Next express function (lifecycle).
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    // look for the building in cache data
    if (this._zones.length > 0) return this._zones;

    // try to fetch it from statics
    const result = <IZoneDocument[]>await this._repo.getAll();
    if (!result) throw new ErrorHandler(404, 'Not a single zone could be found.');

    // add it to cache data then return it
    this._zones = result;
    return result;
  }

  /**
   * Get a specific zone from statics database.
   * @param req Recevied client request.
   * @param res Response to send.
   * @param next Next express function (lifecycle).
   */
  async get(req: Request, res: Response, next: NextFunction) {
    if (helper.isObjectEmpty(req.params) || !req.params.code)
      throw new ErrorHandler(400, 'Missing code in params.');

    // look for the building in cache data
    const existing = this._zones.find(b => b?.code === req.params.code);
    if (!existing) {
      // try to fetch it from statics
      const result = <IZoneDocument>await this._repo.findByCode(req.params.code as string);
      if (!result) throw new ErrorHandler(404, `Zone '${req.params.code}' couldn't be found.`);

      // add it to cache data then return it
      this._zones = [...this._zones, result];
      return result;
    }
    return existing;
  }
}