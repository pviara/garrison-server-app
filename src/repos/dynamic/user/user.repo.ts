import ErrorHandler from '../../../config/models/error/error-handler.model';

import LoggerService from '../../../config/services/logger/logger.service';
import { ELogType as logType } from '../../../config/models/log/log.model';

import { ObjectId } from 'mongodb';
import { Connection } from 'mongoose';

import { IUser, IUserModel } from '../../../config/models/data/user/user.types';

import IUserCreate from '../../../config/models/data/user/payloads/IUserCreate';

import bcrypt from 'bcrypt';
import pswGen from 'generate-password';

import mjml2html from 'mjml';

import mailingService from '../../../config/services/mailing/mailing.service';
import newUserEmail from '../../../store/template/e-mail/new-user.email';

/**
 * Handle interactions with user documents from database dynamic.
 */
export default class UserRepository {
  private _logger = new LoggerService(this.constructor.name);

  private _model = <IUserModel>{};

  constructor(private _connection: Connection) {
    this._logger.log(logType.pending, 'Initializing user repo...');
    this._model = <IUserModel>this._connection?.model('user');
    this._logger.log(logType.pass, 'Initialized user repo');
  }

  async findById(id: ObjectId) {
    const t = 'hey';
    return await this._model.findById(id);
  }
  
  async findByName(name: string) {
    return await this._model.findByName(name);
  }

  async findByEmail(email: string) {
    return await this._model.findByEmail(email);
  }
  
  async create(payload: IUserCreate) {
    const existing = await this.findByName(payload.username)
      || await this.findByEmail(payload.email);
    if (existing) {
      throw new ErrorHandler(409, 'User already exists');
    }

    // init user object to create
    const user: IUser = {
      username: payload.username,
      email: payload.email
    };

    // generate the random password
    const genPassword = pswGen.generate({
      length: 8,
      numbers: true
    });

    // generate both salt and hash
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(genPassword, salt);

    // assign his password to user
    user.password = { hash, salt };

    // start creation process
    const created = await this._model.create(user);

    // prepare the e-mail to send
    let emailContent = newUserEmail.generateHTML(user.username, user.email, genPassword);
    emailContent = mjml2html(emailContent).html;

    // send the foresaid e-mail
    await mailingService.send(user.email, 'Your credentials', emailContent);

    return created;
  }
}