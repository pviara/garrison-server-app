import { model } from 'mongoose';

import userSchema from './user.schema';
import { IUserDocument } from './user.types';

/** Interactive mongoose user model. */
export const userModel = model<IUserDocument>('user', userSchema);