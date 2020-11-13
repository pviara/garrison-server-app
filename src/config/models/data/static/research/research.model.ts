import { model } from 'mongoose';

import researchSchema from './research.schema';
import { IResearchDocument, IResearchModel } from './research.types';

/** Interactive mongoose research model. */
export const researchModel = model<IResearchDocument>('research', researchSchema) as IResearchModel;