import { Schema } from 'mongoose';

import { findByCode } from '../static.types';

const unitSchema = new Schema({
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
      },
      givenExperience: Number
    },
    required: true
  },
  statistics: {
    type: {
      types: {
        main: Schema.Types.Mixed,
        fight: {
          type: Schema.Types.Mixed,
          required: false
        }
      },
      health: Number,
      attack: {
        type: {
          points: {
            min: Number,
            max: Number
          },
          cooldown: Number,
          isDistance: Boolean,
        },
        required: false
      },
      defense: {
        type: {
          points: {
            min: Number,
            max: Number
          },
          cooldown: Number,
          isDistance: Boolean,
        },
        required: false
      }
    },
    required: true
  }
});

unitSchema.statics.findByCode = findByCode;

export default unitSchema;