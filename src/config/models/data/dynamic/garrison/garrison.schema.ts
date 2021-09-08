import { Schema } from 'mongoose';

import { IGarrison, IGarrisonDocument } from './garrison.types';

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
            _id: Schema.Types.ObjectId,
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

// 🧹 clean it up before saving it !
garrisonSchema.pre('save', function (next) {
  // if (process.env.APP_ENV === 'dev') {
  //   next();
  //   return;
  // }

  const now = new Date();
  const garrison = this as IGarrisonDocument;

  for (const building of garrison.instances.buildings) {
    building.constructions = building
      .constructions
      .sort(
        (prev, next) => prev.endDate.getTime() - next.endDate.getTime()
      );
  }

  const { units } = garrison.instances;
  for (let i = 0; i < garrison.instances.units.length; i++) {
    if (units[i].quantity === 0) {
      units.splice(i, 1);
      continue;
    }
    
    units[i].state.assignments = units[i]
      .state
      .assignments
      .filter(a => a.endDate.getTime() > now.getTime());
  }

  garrison.markModified('instances.buildings');
  garrison.markModified('instances.units');

  next();
});

export default garrisonSchema;