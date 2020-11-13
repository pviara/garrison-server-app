import { Schema } from 'mongoose';

const researchSchema = new Schema({
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
      wood: Number
    },
    duration: Number,
    requiredEntities: {
      type: Schema.Types.Mixed,
      required: false
    }
  },
  target: {
    entity: String,
    identifier: Schema.Types.Mixed
  },
  actions: {
    statistics: String,
    operation: String,
    value: Number
  }
});

export default researchSchema;