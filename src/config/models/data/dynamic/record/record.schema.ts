import { Schema, Types } from "mongoose";

const recordSchema = new Schema({
  garrisonId: {
    type: Types.ObjectId,
    required: true
  },
  moment: Date,
  entity: {
    type: String,
    required: true
  },
  code: String,
  quantity: Number,
  action: {
    type: String,
    required: true
  },
  resources: {
    gold: Number,
    wood: Number,
    food: Number,
    plot: Number
  }
});

export default recordSchema;