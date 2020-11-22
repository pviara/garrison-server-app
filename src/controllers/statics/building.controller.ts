import { Request, Response, NextFunction } from 'express';

import BuildingRepository from '../../repos/statics/building/building.repo';

import helper from '../../utils/helper.utils';

import { IBuildingDocument } from '../../config/models/data/static/building/building.types';

export default class BuildingController {
  constructor(private _repo: BuildingRepository) {}

  /**
   * Get all buildings or one specific building from statics database.
   * @param req Recevied client request.
   * @param res Response to send.
   * @param next Next express function (lifecycle).
   */
  async get(req: Request, res: Response, next: NextFunction) {
    return (helper.isObjectEmpty(req.query) || !req.query.code)
      ? await this._repo.getAll()
      : <IBuildingDocument>await this._repo.findByCode(req.query.code as string);
  }
}