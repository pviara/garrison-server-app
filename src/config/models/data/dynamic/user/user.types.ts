import { Document, Model } from 'mongoose';

/**
 * Represents a standard User Document from database.
 * Includes both IUser and Document own fields.
 */
export interface IUserDocument extends IUser, Document {
  /**
   * Check whether the given password matches the user's password.
   * @param password Given password.
   */
  validPassword(password: string): boolean;
}

/**
 * Represents a standard User mongoose model.
 * Contains documents of type IUserDocument.
 */
export interface IUserModel extends Model<IUserDocument> {
  /**
   * Find a user by its name.
   * @param this User model.
   * @param name Name to look for.
   */
  findByName(this: Model<IUserDocument, {}>, username: string): Promise<IUserDocument>;

  /**
   * Find a user by its e-mail.
   * @param this User model.
   * @param name E-mail to look for.
   */
  findByEmail(this: Model<IUserDocument, {}>, email: string): Promise<IUserDocument>;
}

/**
 * The representation of a user.
 */
export interface IUser {
  /** User's both displayed nickname and login. */
  username: string;
  
  /** User's both e-mail and login. */
  email: string;

  /** User's password details. */
  password?: {
    hash: string;
    salt: string;
  };

  /** Indicates whether the user has confirmed his account. */
  isConfirmed?: boolean;
}