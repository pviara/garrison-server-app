import { Schema } from 'mongoose';

import { findByEmail, findByName } from './user.types';

const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: {
      hash: String,
      salt: String
    },
    required: true
  },
  isConfirmed: {
    type: Boolean,
    default: false
  }
});

userSchema.statics.findByName = findByName;
userSchema.statics.findByEmail = findByEmail;

export default userSchema;