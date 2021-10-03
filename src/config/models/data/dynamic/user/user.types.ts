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

  /**
   * Generate a signed JSON Web Token.
   */
  generateJWT(): string;
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
}

/**
 * The representation of a user.
 */
export interface IUser {
  /** User's displayed nickname. */
  username: string;

  /** User's password details. */
  password: {
    hash: string;
    salt: string;
  };

  /** Indicates whether the user has confirmed his account. */
  isConfirmed?: boolean;
}