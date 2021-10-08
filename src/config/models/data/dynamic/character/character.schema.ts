import { Schema } from 'mongoose';

import helper from '../../../../../utils/helper.utils';

const characterSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  name: {
    type: String,
    set: helper.capitalize,
    required: true
  },
  side: {
    type: {
      faction: String,
      banner: String
    },
    required: true
  },
  experience: {
    type: Number,
    default: 0
  }
});

export default characterSchema;