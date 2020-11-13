import { model } from 'mongoose';

import garrisonSchema from './garrison.schema';
import { IGarrisonDocument } from './garrison.types';

/** Interactive mongoose garrison model. */
export const garrisonModel = model<IGarrisonDocument>('garrison', garrisonSchema);