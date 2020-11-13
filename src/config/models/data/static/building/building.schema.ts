import { Schema } from 'mongoose';

const buildingSchema = new Schema({
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
  upgrades: [{
    level: Number,
    word: Schema.Types.Mixed,
    requiredEntities: {
      type: Schema.Types.Mixed,
      required: false
    }
  }],
  extension: {
    requiredEntities: {
      type: Schema.Types.Mixed,
      required: false
    },
    maxLevel: Number,
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
    }
  }
});

export default buildingSchema;