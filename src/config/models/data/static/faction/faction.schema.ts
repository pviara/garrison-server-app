import mongoose, { Schema } from 'mongoose';

const factionSchema = new mongoose.Schema({
  code: String,
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

export default factionSchema;