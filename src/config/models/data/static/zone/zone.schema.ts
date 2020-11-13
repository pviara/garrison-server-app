import { Schema } from 'mongoose';

import { findByCode } from '../static.types';

const zoneSchema = new Schema({
  code: String,
  side: String,
  coordinates: {
    x: Number,
    y: Number
  },
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

zoneSchema.statics.findByCode = findByCode;

export default zoneSchema;