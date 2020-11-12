import { model } from 'mongoose';

import factionSchema from './faction.schema';
import { IFactionDocument } from './faction.types';

/** Interactive mongoose faction model. */
export const factionModel = model<IFactionDocument>('faction', factionSchema);