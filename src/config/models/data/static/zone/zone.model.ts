import { model } from 'mongoose';

import zoneSchema from './zone.schema';
import { IZoneDocument, IZoneModel } from './zone.types';

/** Interactive mongoose zone model. */
export const zoneModel = model<IZoneDocument>('zone', zoneSchema) as IZoneModel;