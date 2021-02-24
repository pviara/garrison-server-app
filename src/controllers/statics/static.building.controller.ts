import { Request, Response, NextFunction } from 'express';

import BuildingRepository from '../../repos/statics/building/building.repo';

import helper from '../../utils/helper.utils';

import { IBuildingDocument } from '../../config/models/data/static/building/building.types';

import ErrorHandler from '../../config/models/error/error-handler.model';

export default class StaticBuildingController {
  private _buildings: IBuildingDocument[] = [];
  
  constructor(private _repo: BuildingRepository) {}

  /**
   * Get all buildings from statics database.
   * @param req Recevied client request.
   * @param res Response to send.
   * @param next Next express function (lifecycle).
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    // look for the building in cache data
    if (this._buildings.length > 0) return this._buildings;

    // try to fetch it from statics
    const result = <IBuildingDocument[]>await this._repo.getAll();
    if (!result) throw new ErrorHandler(404, 'Not a single building could be found.');

    // add it to cache data then return it
    this._buildings = result;
    return result;
  }

  /**
   * Get a specific building from statics database.
   * @param req Recevied client request.
   * @param res Response to send.
   * @param next Next express function (lifecycle).
   */
  async get(req: Request, res: Response, next: NextFunction) {
    if (helper.isObjectEmpty(req.params) || !req.params.code)
      throw new ErrorHandler(400, 'Missing code in params.');

    // look for the building in cache data
    const existing = this._buildings.find(b => b?.code === req.params.code);
    if (!existing) {
      // try to fetch it from statics
      const result = <IBuildingDocument>await this._repo.findByCode(req.params.code as string);
      if (!result) throw new ErrorHandler(404, `Building '${req.params.code}' couldn't be found.`);

      // add it to cache data then return it
      this._buildings = [...this._buildings, result];
      return result;
    }
    return existing;
  }
}