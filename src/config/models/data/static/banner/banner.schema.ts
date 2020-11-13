import { Schema } from 'mongoose';

import { findByCode } from '../static.types';

const bannerSchema = new Schema({
  code: String,
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