import { Schema } from 'mongoose';

import { findByCode } from '../static.types';

const buildingSchema = new Schema({
  code: {
    type: String,
    unique: true
  },
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
    requiredEntities: {
      type: Schema.Types.Mixed,
      required: false
    },
    maxLevel: Number,
    required: false
  },

  types: {
    harvest: {
      resource: String,
      maxWorkforce: {
        type: Number,
        required: false
      },
      gift: {
        type: Number,
        required: false
      },
      required: false
    }
  }
});

buildingSchema.statics.findByCode = findByCode;

export default buildingSchema;