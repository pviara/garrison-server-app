import { Response, NextFunction } from 'express';
import SignedRequest from '../../../config/models/data/express/SignedRequest';

import { ObjectId } from 'mongodb';
import { isValidObjectId } from 'mongoose';

import helper from '../../../utils/helper.utils';

import ErrorHandler from '../../../config/models/error/error-handler.model';

import RegisterRepository from '../../../repos/dynamic/register/register.repo';

export default class RegisterController {
  constructor(private _repo: RegisterRepository) {}
  
  /**
   * Get all records from a specific garrison.
   * @param req Recevied client request.
   * @param res Response to send.
   * @param next Next express function (lifecycle).
   */
  async getFromGarrison(req: SignedRequest, res: Response, next: NextFunction) {
    if (helper.isObjectEmpty(req.params) || !req.params.garrisonId) {
      throw new ErrorHandler(400, 'Missing garrisonId in params.');
    }

    // check on param cast possibility
    const isValidId = isValidObjectId(req.params.garrisonId);
    if (!isValidId) throw new ErrorHandler(400, `Unable to cast '${req.params.garrisonId}' to ObjectId.`);

    return await this
      ._repo
      .getFromGarrison(
        new ObjectId(req.params.garrisonId)
      );
  }
}