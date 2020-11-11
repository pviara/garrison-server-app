import { IDocument } from '../model';

/**
 * The representation of a user.
 */
export interface IUser extends IDocument {
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
  isConfirmed: boolean;
}