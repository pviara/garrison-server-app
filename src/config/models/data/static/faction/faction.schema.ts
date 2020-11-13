import { Schema } from 'mongoose';

import { findByCode } from '../static.types';

const factionSchema = new Schema({
  code: {
    type: String,
    unique: true,
    required: true
  },
  word: {
    type: Schema.Types.Mixed,
    required: true
  },
  pictures: {
    icon: String,
    image: {
      type: String,
      required: false
    },
    required: false
  }
});

factionSchema.statics.findByCode = findByCode;

export default factionSchema;