import { Response, NextFunction, Request } from 'express';

import helper from '../../../utils/helper.utils';

import ErrorHandler from '../../../config/models/error/error-handler.model';
import UserRepository from '../../../repos/dynamic/user/user.repo';
import IUserCreate from '../../../config/models/data/dynamic/user/payloads/IUserCreate';

export default class UserController {
  constructor(private _repo: UserRepository) {}

  /**
   * Create a new character.
   * @param req Recevied client request.
   * @param res Response to send.
   * @param next Next express function (lifecycle).
   */
  async create(req: Request, res: Response, next: NextFunction) {
    if (!req.body
    || helper.isObjectEmpty(req.body)
    || !req.body.email
    || !req.body.username)
      throw new ErrorHandler(400, 'Missing entire body or one or a few mandatory fields.');

    // launch creation process
    return await this._repo.create(
      <IUserCreate>req.body
    );
  }
}