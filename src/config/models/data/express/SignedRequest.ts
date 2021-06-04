import { Request } from 'express';
import { IUser } from '../dynamic/user/user.types';

export default interface SignedRequest extends Request {
  author: Partial<IUser>;
}