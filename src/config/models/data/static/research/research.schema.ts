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
  pictures: {
    icon: String,
    image: {
      type: String,
      required: false
    },
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
      }
    },
    required: true
  },
  target: {
    type: {
      entity: String,
      identifier: Schema.Types.Mixed
    },
    required: true
  },
  actions: {
    type: {
      statistics: String,
      operation: String,
      value: Number
    },
    required: true
  }
});

researchSchema.statics.findByCode = findByCode;

export default researchSchema;