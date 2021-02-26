import { Model } from 'mongoose';

import { IUserDocument } from './user.types';

/**
 * Find a user by its name.
 * @param this User model.
 * @param name Name to look for.
 */
export async function findByName(this: Model<IUserDocument, {}>, username: string) {
  return await this.findOne({ username });
}

/**
 * Find a user by its e-mail.
 * @param this User model.
 * @param name E-mail to look for.
 */
export async function findByEmail(this: Model<IUserDocument, {}>, email: string) {
  return await this.findOne({ email });
}