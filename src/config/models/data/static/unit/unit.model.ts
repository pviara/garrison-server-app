import { model } from 'mongoose';

import unitSchema from './unit.schema';
import { IUnitDocument } from './unit.types';

/** Interactive mongoose unit model. */
export const unitModel = model<IUnitDocument>('unit', unitSchema);