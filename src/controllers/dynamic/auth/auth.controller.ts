import { Request, Response, NextFunction } from 'express';

import helper from '../../../utils/helper.utils';

import ErrorHandler from '../../../config/models/error/error-handler.model';

import AuthService from '../../../config/services/auth/auth.service';

export default class AuthController {
  constructor(private _service: AuthService) {}
  
  async authenticate(req: Request, res: Response, next: NextFunction) {
    if (!req.body
    || helper.isObjectEmpty(req.body)
    || !req.body.email
    || !req.body.password)
      throw new ErrorHandler(400, 'Missing entire body or one or a few mandatory fields.');

    return await this._service.authenticate(req.body.email, req.body.password);
  }
}