import mongoose, { Schema } from 'mongoose';

const zoneSchema = new mongoose.Schema({
  code: String,
  side: String,
  coordinates: {
    x: Number,
    y: Number
  },
  word: Schema.Types.Mixed,
  pictures: {
    icon: String,
    image: {
      type: String,
      required: false
    },
    required: false
  }
});

export default zoneSchema;