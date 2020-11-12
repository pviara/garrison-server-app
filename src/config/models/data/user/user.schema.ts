import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
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

export default userSchema;