import { Request, Response, NextFunction } from 'express';

import UnitRepository from '../../repos/statics/unit/unit.repo';

import helper from '../../utils/helper.utils';

import { IUnitDocument } from '../../config/models/data/static/unit/unit.types';

export default class UnitController {
  constructor(private _repo: UnitRepository) {}

  /**
   * Get all units or one specific unit from statics database.
   * @param req Recevied client request.
   * @param res Response to send.
   * @param next Next express function (lifecycle).
   */
  async get(req: Request, res: Response, next: NextFunction) {
    return (helper.isObjectEmpty(req.query) || !req.query.code)
      ? await this._repo.getAll()
      : <IUnitDocument>await this._repo.findByCode(req.query.code as string);
  }
}