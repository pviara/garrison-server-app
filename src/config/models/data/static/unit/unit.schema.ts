import { Schema } from 'mongoose';

import { findByCode } from '../static.types';

const unitSchema = new Schema({
  code: String,
  word: Schema.Types.Mixed,
  pictures: {
    icon: String,
    image: {
      type: String,
      required: false
    },
    required: false
  },
  instantiation: {
    building: String,
    cost: {
      gold: Number,
      wood: Number,
      food: Number
    },
    duration: Number,
    requiredEntities: {
      type: Schema.Types.Mixed,
      required: false
    }
  },
  statistics: {
    type: {
      main: Schema.Types.Mixed,
      fight: {
        type: Schema.Types.Mixed,
        required: false
      }
    },
    health: Number,
    attack: {
      points: {
        min: Number,
        max: Number
      },
      cooldown: Number,
      isDistance: Boolean,
      required: false
    },
    defense: {
      points: {
        min: Number,
        max: Number
      },
      cooldown: Number,
      isDistance: Boolean,
      required: false
    }
  }
});

unitSchema.statics.findByCode = findByCode;

export default unitSchema;