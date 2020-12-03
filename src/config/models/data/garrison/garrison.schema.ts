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
      plot: Number,
      goldLastUpdate: Date,
      woodLastUpdate: Date
    },
    required: true
  },
  instances: {
    type: {
      buildings: [{
        _id: Schema.Types.ObjectId,
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
            buildingId: Schema.Types.ObjectId,
            quantity: Number,
            endDate: Date
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