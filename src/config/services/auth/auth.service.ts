import ErrorHandler from '../../../config/models/error/error-handler.model';

import MonitoringService from '../../../config/services/monitoring/monitoring.service'
import {
  ELogType as logType
} from '../../../config/models/log/log.model';
import IMonitored from '../../../config/models/IMonitored';

import { Model, Document } from 'mongoose';

import UserRepository from '../../../repos/dynamic/user/user.repo';

import passport from 'passport';
import { Strategy } from 'passport-local';

/**
 * Handle authentication processes.
 */
export default class AuthService implements IMonitored {
  private _monitor = new MonitoringService(this.constructor.name);

  private _userModel = <Model<Document> | undefined>{};

  /** Retrieve class monitoring service. */
  get monitor() {
    return this._monitor;
  }

  constructor(private _dynamicModels: Model<Document, {}>[]) {
    this._configure();
  }

  async authenticate(req: any, res: any) {
    const authenticating = new Promise((resolve, reject) => {
      passport.authenticate(
        'user-auth',
        (err, user) => {
          if (err) reject(err);
          if (!user) reject('Incorrect e-mail and/or password');
          resolve(user);
        }
      )(req, res);
    });

      const result = authenticating
        .then(result => result)
        .catch(err => {
          throw new ErrorHandler(401, 'Authentication failed');
        });
      
      return result;
  }

  private async _configure() {
    this._monitor.log(logType.pending, 'Configuring auth repository...');

    this._userModel = this._dynamicModels.find(model => model.modelName == 'user');
    
    passport.use(
      'user-auth', 
      new Strategy({
        usernameField: 'email'
      },
      (email: any, password: any, done: any) => {
        this._userModel?.findOne(
          { email },
          function (err: any, user: any) {
            if (err) return done(err);

            if (!user) {
              return done(null, false, {
                message: 'User not found'
              });
            }

            if (!user.validPassword(password)) {
              return done(null, false, {
                message: 'Incorrect password'
              });
            }

            return done(null, user);
          }
        )
        // // this._userRepo.findByEmail(email)
        // //   .then(user => {
        // //     const validPassword = user.validPassword(password);
        // //     if (!validPassword) {
        // //       return done(null, false, {
        // //         message: 'Incorrect password'
        // //       });
        // //     }
            
        // //     return done(null, user);
        // //   })
        // //   .catch(err => done(err))
      })
    );

    this._monitor.log(logType.pass, 'Configured auth repository');
  }
}