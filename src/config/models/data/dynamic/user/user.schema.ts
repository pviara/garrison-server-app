import { Schema } from 'mongoose';

import helper from '../../../../../utils/helper.utils';

import { findByEmail, findByName } from './user.statics';

import bcrypt from 'bcrypt';

import jwt from 'jsonwebtoken';

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
};

userSchema.methods.generateJWT = function () {
  const expires = new Date();
  expires.setDate(expires.getDate() + 7);
  
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      expires: expires.getTime() / 1000
    },
    process.env.JWT as string
  );
};

/**
 * Normalize user's e-mail using global helper method(s).
 * @param email User's e-mail.
 */
function _normalize(email: string) {
  return helper.normalize(email, true);
}

export default userSchema;