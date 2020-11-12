import { model } from 'mongoose';

import userSchema from './user.schema';
import { IUserDocument } from './user.types';

/** Interactive mongoose user model. */
export const UserModel = model<IUserDocument>('user', userSchema);