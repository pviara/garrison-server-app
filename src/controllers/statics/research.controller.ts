import { Request, Response, NextFunction } from 'express';

import ResearchRepository from '../../repos/statics/research/research.repo';

import helper from '../../utils/helper.utils';

import { IResearchDocument } from '../../config/models/data/static/research/research.types';

export default class ResearchController {
  constructor(private _repo: ResearchRepository) {}

  /**
   * Get all researches or one specific research from statics database.
   * @param req Recevied client request.
   * @param res Response to send.
   * @param next Next express function (lifecycle).
   */
  async get(req: Request, res: Response, next: NextFunction) {
    return (helper.isObjectEmpty(req.query) || !req.query.code)
      ? await this._repo.getAll()
      : <IResearchDocument>await this._repo.findByCode(req.query.code as string);
  }
}