import { Schema } from 'mongoose';

import { findByCode } from '../static.types';

const factionSchema = new Schema({
  code: String,
  word: Schema.Types.Mixed,
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