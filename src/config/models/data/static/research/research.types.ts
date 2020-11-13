import { Document, Model } from 'mongoose';

import { IStaticEntity, IStaticEntityCost } from '../static.types';

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
export interface IResearchModel extends Model<IResearchDocument> {}

/**
 * The representation of a research.
 */
export interface IResearch extends IStaticEntity {
  /** Instantiation requirements and characteristics. */
  instantiation: {
    cost: IStaticEntityCost,
    duration: number;
    requiredEntities?: IRequiredBuilding | IRequiredBuilding[];
  };

  target: {
    /** Type of the affected target (e.g. unit or building). */
    entity: string;
  
    /** Code, type or subtype of the affected unit or building */
    identifier: string | {
      fightType: string;
    };
  };

  /** How does this research affect its target ? */
  actions: {
    /** Path to the impacted statistics (e.g. 'attack.points.max'). */
    statistics: string;

    /** Operation sign. */
    operation: string;

    /** Value to operate with. */
    value: number;
  }[];
}