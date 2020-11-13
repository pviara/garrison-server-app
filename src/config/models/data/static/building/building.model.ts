import { model } from 'mongoose';

import buildingSchema from './building.schema';
import { IBuildingDocument, IBuildingModel } from './building.types';

/** Interactive mongoose building model. */
export const buildingModel = model<IBuildingDocument>('building', buildingSchema) as IBuildingModel;