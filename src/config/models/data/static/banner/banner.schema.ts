import { Schema } from 'mongoose';

import { findByCode } from '../static.types';

const bannerSchema = new Schema({
  code: {
    type: String,
    unique: true,
    required: true
  },
  side: {
    type: String,
    required: true
  },
  word: {
    type: Schema.Types.Mixed,
    required: true
  },
  description: {
    type: String,
    required: false
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

bannerSchema.statics.findByCode = findByCode;

export default bannerSchema;