import { Schema } from 'mongoose';

const garrisonSchema = new Schema({
  characterId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  zone: {
    type: String,
    required: true
  },
  resources: {
    type: {
      gold: Number,
      wood: Number,
      food: Number,
      plot: Number
    },
    required: true
  },
  instances: {
    type: {
      buildings: [{
        code: String,
        constructions: [{
          beginDate: Date,
          endDate: Date,
          workforce: Number,
          improvement: {
            type: {
              type: String,
              level: Number
            },
            required: false
          }
        }]
      }],
      units: [{
        code: String,
        quantity: Number,
        state: {
          assignments: [{
            code: String,
            quantity: Number
          }]
        }
      }],
      researches: [{
        code: String,
        level: {
          type: Number,
          required: false
        }
      }]
    },
    required: false
  }
});

export default garrisonSchema;