import { model } from 'mongoose';

import characterSchema from './character.schema';
import { ICharacterDocument } from './character.types';

/** Interactive mongoose character model. */
export const bannerModel = model<ICharacterDocument>('character', characterSchema);