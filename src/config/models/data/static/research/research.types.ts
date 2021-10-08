import { Document, Model } from 'mongoose';

import { IStaticEntity, IStaticEntityCost, IStaticEntityStatics } from '../static.types';

import { IRequiredBuilding } from '../building/building.types';

/**
 * Represents a standard Research Document from database.
 * Includes both IResearch and Document own fields.
 */
export interface IResearchDocument extends IResearch, Document {}

/**
 * Represents a standard Research mongoose model.
 * Contains documents of type IResearchDocument.
 */
export interface IResearchModel extends Model<IResearchDocument>, IStaticEntityStatics {}

/**
 * The representation of a research.
 */
export interface IResearch extends IStaticEntity {
  /** Instantiation requirements and characteristics. */
  instantiation: {
    cost: IStaticEntityCost;
    minWorkforce: number;
    duration: number;
    requiredEntities?: {
      buildings: IRequiredBuilding[];
    };
    givenExperience: number;
  };

  /** Number to add to any base variable in harvest buildings, units attack, defense... */
  bonus: number;
}