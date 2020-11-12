import { Schema } from 'mongoose';

const factionSchema = new Schema({
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