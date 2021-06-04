import { Response, NextFunction } from 'express';
import SignedRequest from '../../../config/models/data/express/SignedRequest';

import { ObjectId } from 'mongodb';
import { isValidObjectId } from 'mongoose';

import helper from '../../../utils/helper.utils';

import ErrorHandler from '../../../config/models/error/error-handler.model';
import CharacterRepository from '../../../repos/dynamic/character/character.repo';
import ICharacterCreate from '../../../config/models/data/dynamic/character/payloads/ICharacterCreate';

export default class CharacterController {
  constructor(private _repo: CharacterRepository) {}
  
  /**
   * Create a new character.
   * @param req Recevied client request.
   * @param res Response to send.
   * @param next Next express function (lifecycle).
   */
  async getFromUser(req: SignedRequest, res: Response, next: NextFunction) {
    if (helper.isObjectEmpty(req.params) || !req.params.userId)
      throw new ErrorHandler(400, 'Missing userId in params.');

      // check on param cast possibility
      const isValidId = isValidObjectId(req.params.userId);
      if (!isValidId) throw new ErrorHandler(400, `Unable to cast '${req.params.userId}' to ObjectId.`);

      const result = await this._repo.getFromUser(new ObjectId(req.params.userId));

      return result;
  }

  /**
   * Create a new character.
   * @param req Recevied client request.
   * @param res Response to send.
   * @param next Next express function (lifecycle).
   */
  async create(req: SignedRequest, res: Response, next: NextFunction) {
    if (!req.body
    || helper.isObjectEmpty(req.body)
    || !req.body.userId
    || !req.body.name
    || !req.body.side
    || !req.body.side.faction
    || !req.body.side.banner)
      throw new ErrorHandler(400, 'Missing entire body or one or a few mandatory fields.');

    // check on userId cast possibility
    const isValidId = isValidObjectId(req.body.userId);
    if (!isValidId) throw new ErrorHandler(400, `Unable to cast '${req.body.userId}' to ObjectId.`);

    // launch creation process
    return await this._repo.create(
      <ICharacterCreate>{
        ...req.body,
        userId: new ObjectId(req.body.userId)
      }
    );
  }
}