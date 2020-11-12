import { model } from 'mongoose';

import zoneSchema from './zone.schema';
import { IZoneDocument } from './zone.types';

/** Interactive mongoose zone model. */
export const zoneModel = model<IZoneDocument>('zone', zoneSchema);