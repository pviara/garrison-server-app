import { Schema } from 'mongoose';

import helper from '../../../../utils/helper.utils';

const characterSchema = new Schema({
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
  }
});

export default characterSchema;