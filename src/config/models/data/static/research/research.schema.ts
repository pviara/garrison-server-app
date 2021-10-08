import { Schema } from 'mongoose';
import { findByCode } from '../static.types';

const researchSchema = new Schema({
  code: {
    type: String,
    unique: true,
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
  instantiation: {
    type: {
      cost: {
        gold: Number,
        wood: Number
      },
      duration: Number,
      requiredEntities: {
        type: Schema.Types.Mixed,
        required: false
      },
      givenExperience: Number
    },
    required: true
  },
  bonus: {
    type: Number,
    required: true
  }
});

researchSchema.statics.findByCode = findByCode;

export default researchSchema;