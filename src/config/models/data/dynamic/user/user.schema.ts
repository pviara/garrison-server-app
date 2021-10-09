import { Schema } from 'mongoose';

import { findByName } from './user.statics';

import bcrypt from 'bcrypt';

import jwt from 'jsonwebtoken';

const userSchema = new Schema({
  username: {
    type: String,
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
      expires: Math.trunc(expires.getTime() / 1000)
    },
    process.env.JWT as string
  );
};

export default userSchema;