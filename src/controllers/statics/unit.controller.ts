import { Request, Response, NextFunction } from 'express';

import UnitRepository from '../../repos/statics/unit/unit.repo';

import helper from '../../utils/helper.utils';

import { IUnitDocument } from '../../config/models/data/static/unit/unit.types';

import ErrorHandler from '../../config/models/error/error-handler.model';

export default class UnitController {
  private _units: IUnitDocument[] = [];
  
  constructor(private _repo: UnitRepository) {}

  /**
   * Get all units from statics database.
   * @param req Recevied client request.
   * @param res Response to send.
   * @param next Next express function (lifecycle).
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    // look for the building in cache data
    if (this._units.length > 0) return this._units;

    // try to fetch it from statics
    const result = <IUnitDocument[]>await this._repo.getAll();
    if (!result) throw new ErrorHandler(404, 'Not a single unit could be found.');

    // add it to cache data then return it
    this._units = result;
    return result;
  }

  /**
   * Get a specific unit from statics database.
   * @param req Recevied client request.
   * @param res Response to send.
   * @param next Next express function (lifecycle).
   */
  async get(req: Request, res: Response, next: NextFunction) {
    if (helper.isObjectEmpty(req.params) || !req.params.code)
      throw new ErrorHandler(400, 'Missing code in params.');

    // look for the building in cache data
    const existing = this._units.find(b => b?.code === req.params.code);
    if (!existing) {
      // try to fetch it from statics
      const result = <IUnitDocument>await this._repo.findByCode(req.params.code as string);
      if (!result) throw new ErrorHandler(404, `Unit '${req.params.code}' couldn't be found.`);

      // add it to cache data then return it
      this._units = [...this._units, result];
      return result;
    }
    return existing;
  }
}