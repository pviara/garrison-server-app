import ErrorHandler from '../../models/error/error-handler.model';

import MonitoringService from '../../../config/services/monitoring/monitoring.service'
import {
  ELogType as logType
} from '../../../config/models/log/log.model';
import IMonitored from '../../../config/models/IMonitored';

import UserRepository from '../../../repos/dynamic/user/user.repo';

import bcrypt from 'bcrypt';

/**
 * Handle authentication processes.
 */
export default class AuthService implements IMonitored {
  private _monitor = new MonitoringService(this.constructor.name);

  /** Retrieve class monitoring service. */
  get monitor() {
    return this._monitor;
  }

  constructor(private _userRepository: UserRepository) {
    this._monitor.log(logType.pass, 'Initialized auth service');
  }

  /**
   * Authenticate an user using both his username and password.
   * @param username Given username.
   * @param password Given password.
   */
  async authenticate(username: string, password: string) {
    const user = await this._userRepository.findByName(username);
    
    const hash = await bcrypt
      .hash(
        password,
        user.password.salt
      );
    if (hash !== user.password.hash)
      throw new ErrorHandler(401, 'Incorrect username or password.');
    
    const {
      password: hidden,
      ...returned
    } = user.toJSON();

    return {
      ...returned,
      token: user.generateJWT()
    };
  }
}