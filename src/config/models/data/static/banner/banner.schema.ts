import mongoose, { Schema } from 'mongoose';

const bannerSchema = new mongoose.Schema({
  code: String,
  side: String,
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

export default bannerSchema;