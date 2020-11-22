import { Request, Response, NextFunction } from 'express';

import ResearchRepository from '../../repos/statics/research/research.repo';

import helper from '../../utils/helper.utils';

import { IResearchDocument } from '../../config/models/data/static/research/research.types';

import ErrorHandler from '../../config/models/error/error-handler.model';

export default class ResearchController {
  private _researches: IResearchDocument[] = [];
  
  constructor(private _repo: ResearchRepository) {}

  /**
   * Get all researches from statics database.
   * @param req Recevied client request.
   * @param res Response to send.
   * @param next Next express function (lifecycle).
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    // look for the building in cache data
    if (this._researches.length > 0) return this._researches;

    // try to fetch it from statics
    const result = <IResearchDocument[]>await this._repo.getAll();
    if (!result) throw new ErrorHandler(404, 'Not a single research could be found.');

    // add it to cache data then return it
    this._researches = result;
    return result;
  }

  /**
   * Get a specific research from statics database.
   * @param req Recevied client request.
   * @param res Response to send.
   * @param next Next express function (lifecycle).
   */
  async get(req: Request, res: Response, next: NextFunction) {
    if (helper.isObjectEmpty(req.params) || !req.params.code)
      throw new ErrorHandler(400, 'Missing code in params.');

    // look for the building in cache data
    const existing = this._researches.find(b => b?.code === req.params.code);
    if (!existing) {
      // try to fetch it from statics
      const result = <IResearchDocument>await this._repo.findByCode(req.params.code as string);
      if (!result) throw new ErrorHandler(404, `Research '${req.params.code}' couldn't be found.`);

      // add it to cache data then return it
      this._researches = [...this._researches, result];
      return result;
    }
    return existing;
  }
}