import ErrorHandler from '../../../config/models/error/error-handler.model';

import MonitoringService from '../../../config/services/monitoring/monitoring.service'
import {
  ELogType as logType
} from '../../../config/models/log/log.model';

import {
  ObjectId
} from 'mongodb';

import {
  IUser,
  IUserDocument,
  IUserModel
} from '../../../config/models/data/dynamic/user/user.types';

import IUserCreate from '../../../config/models/data/dynamic/user/payloads/IUserCreate';

import bcrypt from 'bcrypt';
import pswGen from 'generate-password';

import mjml2html from 'mjml';

import {
  initService
} from '../../../config/services/init.service';

import newUserEmail from '../../../store/template/e-mail/new-user.email.template';
import IMonitored from '../../../config/models/IMonitored';

/**
 * Handle interactions with user documents from database dynamic.
 */
export default class UserRepository implements IMonitored {
  private _monitor = new MonitoringService(this.constructor.name);

  /** Retrieve class monitoring service. */
  get monitor() {
    return this._monitor;
  }

  constructor(private _model: IUserModel) {
    this._monitor.log(logType.pass, 'Initialized user repository');
  }

  /**
   * Find a user by its id.
   * @param id Given ObjectId.
   * @param strict Sets whether an error is thrown when no user is found.
   * @returns Either an IUserDocument or (maybe) null if strict mode is set to false.
   */
  async findById(id: ObjectId, strict?: true): Promise < IUserDocument > ;
  async findById(id: ObjectId, strict: false): Promise < IUserDocument | null > ;
  async findById(id: ObjectId, strict: boolean = true) {
    const result = await this._model.findById(id);
    if (!result && strict) throw new ErrorHandler(404, `User with userId '${id}' couldn't be found.`);

    return result;
  }

  /**
   * Find a user by its name.
   * @param name Given name.
   * @param strict Sets whether an error is thrown when no user is found.
   * @returns Either an IUserDocument or (maybe) null if strict mode is set to false.
   */
  async findByName(name: string, strict?: true): Promise < IUserDocument > ;
  async findByName(name: string, strict: false): Promise < IUserDocument | null > ;
  async findByName(name: string, strict: boolean = true) {
    const result = await this._model.findByName(name.toLowerCase());
    if (!result && strict) throw new ErrorHandler(404, `User with name '${name}' couldn't be found.`);

    return result;
  }

  /**
   * Find a user by its e-mail.
   * @param email Given e-mail.
   * @param strict Sets whether an error is thrown when no user is found.
   * @returns Either an IUserDocument or (maybe) null if strict mode is set to false.
   */
  async findByEmail(email: string, strict?: true): Promise < IUserDocument > ;
  async findByEmail(email: string, strict: false): Promise < IUserDocument | null > ;
  async findByEmail(email: string, strict: boolean = true) {
    const result = await this._model.findByEmail(email.toLowerCase());
    if (!result && strict) throw new ErrorHandler(404, `User with email '${email}' couldn't be found.`);

    return result;
  }

  /**
   * Create and save a new user in database.
   * @param payload @see IUserCreate
   */
  async create(payload: IUserCreate) {
    if (await this.findByName(payload.username, false) || await this.findByEmail(payload.email, false))
      throw new ErrorHandler(409, 'User already exists.');

    // init user object to create
    const user: IUser = {
      username: payload.username,
      email: payload.email,
      password: {
        hash: '',
        salt: ''
      }
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
    user.password = {
      hash,
      salt
    };

    // start creation process
    const created = await this._model.create(user);

    // prepare the e-mail to send
    let emailContent = newUserEmail.generateHTML(user.username, user.email, genPassword);
    emailContent = mjml2html(emailContent).html;

    // send the foresaid e-mail
    await initService.emailingService.send(user.email, 'Your credentials', emailContent);
    
    const {
      password: hidden,
      ...returned
    } = created.toJSON();

    return returned;
  }
}