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