import { Document, Model } from 'mongoose';

/**
 * Represents a standard User Document from database.
 * Includes both IUser and Document own fields.
 */
export interface IUserDocument extends IUser, Document {}

/**
 * Represents a standard User mongoose model.
 * Contains documents of type IUserDocument.
 */
export interface IUserModel extends Model<IUserDocument> {}

/**
 * The representation of a user.
 */
interface IUser {
  /** User's both displayed nickname and login. */
  username: string;
  
  /** User's both e-mail and login. */
  email: string;

  /** User's password details. */
  password: {
    hash: string;
    salt: string;
  };

  /** Indicates whether the user has confirmed his account. */
  isConfirmed?: boolean;
}