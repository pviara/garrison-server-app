import { Schema } from 'mongoose';

import helper from '../../../../../utils/helper.utils';

import { findByEmail, findByName } from './user.statics';

import bcrypt from 'bcrypt';

const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  email: {
    type: String,
    set: _normalize,
    unique: true,
    required: true
  },
  password: {
    type: {
      hash: String,
      salt: String
    }
  },
  isConfirmed: {
    type: Boolean,
    default: false
  }
});

userSchema.statics.findByName = findByName;
userSchema.statics.findByEmail = findByEmail;

userSchema.methods.validPassword = function (password: string) {
  const hash = bcrypt
    .hashSync(password, this.password.salt);
  
  return this.password.hash === hash;
}

/**
 * Normalize user's e-mail using global helper method(s).
 * @param email User's e-mail.
 */
function _normalize(email: string) {
  return helper.normalize(email, true);
}

export default userSchema;