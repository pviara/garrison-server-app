import { Request, Response, NextFunction } from 'express';

import FactionRepository from '../../repos/static/faction.repo';

import helper from '../../utils/helper.utils';

import { IFactionDocument } from '../../config/models/data/static/faction/faction.types';

import ErrorHandler from '../../config/models/error/error-handler.model';

export default class FactionController {
  private _factions: IFactionDocument[] = [];
  
  constructor(private _repo: FactionRepository) {}

  /**
   * Get all factions from statics database.
   * @param req Recevied client request.
   * @param res Response to send.
   * @param next Next express function (lifecycle).
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    // look for the building in cache data
    if (this._factions.length > 0) return this._factions;

    // try to fetch it from statics
    const result = <IFactionDocument[]>await this._repo.getAll();
    if (!result) throw new ErrorHandler(404, 'Not a single faction could be found.');

    // add it to cache data then return it
    this._factions = result;
    return result;
  }

  /**
   * Get a specific faction from statics database.
   * @param req Recevied client request.
   * @param res Response to send.
   * @param next Next express function (lifecycle).
   */
  async get(req: Request, res: Response, next: NextFunction) {
    if (helper.isObjectEmpty(req.params) || !req.params.code)
      throw new ErrorHandler(400, 'Missing code in params.');

    // look for the building in cache data
    const existing = this._factions.find(b => b?.code === req.params.code);
    if (!existing) {
      // try to fetch it from statics
      const result = <IFactionDocument>await this._repo.findByCode(req.params.code as string);
      if (!result) throw new ErrorHandler(404, `Faction '${req.params.code}' couldn't be found.`);

      // add it to cache data then return it
      this._factions = [...this._factions, result];
      return result;
    }
    return existing;
  }
}