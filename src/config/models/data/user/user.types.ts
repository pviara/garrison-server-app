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
export interface IUserModel extends Model<IUserDocument> {
  /**
   * Find a user by its name.
   * @param this User model.
   * @param name Name to look for.
   */
  findByName(this: Model<IUserDocument, {}>, name: string): Promise<IUserDocument>;

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

/**
 * Find a user by its name.
 * @param this User model.
 * @param name Name to look for.
 */
export async function findByName(this: Model<IUserDocument, {}>, name: string) {
  return await this.findOne({ name });
}

/**
 * Find a user by its e-mail.
 * @param this User model.
 * @param name E-mail to look for.
 */
export async function findByEmail(this: Model<IUserDocument, {}>, name: string) {
  return await this.findOne({ name });
}