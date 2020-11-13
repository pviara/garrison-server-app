import { Schema } from 'mongoose';

import { findByCode } from '../static.types';

const bannerSchema = new Schema({
  code: {
    type: String,
    unique: true
  },
  side: String,
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

bannerSchema.statics.findByCode = findByCode;

export default bannerSchema;