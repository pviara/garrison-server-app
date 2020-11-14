import { model } from 'mongoose';

import userSchema from './user.schema';
import { IUserDocument, IUserModel } from './user.types';

/** Interactive mongoose user model. */
export const userModel = model<IUserDocument>('user', userSchema) as IUserModel;