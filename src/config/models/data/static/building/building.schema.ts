import { Schema } from 'mongoose';

import { findByCode } from '../static.types';

const buildingSchema = new Schema({
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
        wood: Number,
        plot: Number
      },
      minWorkforce: Number,
      duration: Number,
      requiredEntities: {
        type: Schema.Types.Mixed,
        required: false
      }
    },
    required: true
  },
  // for 'upgrades' array: the prop 'required' will not exempt it to be initialized inside the document
  // https://stackoverflow.com/questions/27268172/mongoose-schema-to-require-array-that-can-be-empty
  upgrades: {
    type: [{
      level: Number,
      word: Schema.Types.Mixed,
      requiredEntities: {
        type: Schema.Types.Mixed,
        required: false
      },
    }],
    required: false
  },
  extension: {
    type: {
      requiredEntities: {
        type: Schema.Types.Mixed,
        required: false
      },
      maxLevel: Number,
    },
    required: false
  },
  harvest: {
    type: {
      resource: String,
      amount: Number,
      maxWorkforce: {
        type: Number,
        required: false
      }
    },
    required: false
  },
});

buildingSchema.statics.findByCode = findByCode;

export default buildingSchema;