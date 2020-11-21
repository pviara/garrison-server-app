import { Document, Model } from 'mongoose';

import { IStaticEntity, IStaticEntityCost, IStaticEntityStatics } from '../static.types';

/**
 * Represents a standard Building Document from database.
 * Includes both IBuilding and Document own fields.
 */
export interface IBuildingDocument extends IBuilding, Document {}

/**
 * Represents a standard Building mongoose model.
 * Contains documents of type IBuildingDocument.
 */
export interface IBuildingModel extends Model<IBuildingDocument>, IStaticEntityStatics {}

/**
 * The representation of a building.
 */
export interface IBuilding extends IStaticEntity {
  /** Instantiation requirements and characteristics. */
  instantiation: {
    cost: IBuildingCost;
    minWorkforce: number;
    duration: number;
    requiredEntities?: {
      buildings: IRequiredBuilding[];
    }
  };
  
  /** Upgrades list. */
  upgrades?: {
    level: number;
    word: string | {
      side: string;
      jargon: string;
    }[];
    requiredEntities?: {
      buildings: IRequiredBuilding[];
    }
  }[];
  
  /** Extension characteristics. */
  extension?: {
    /** Requirements. */
    requiredEntities?: {
      buildings: IRequiredBuildingForExtensionLevel[];
    }
    
    /** Maximum extension level. */
    maxLevel?: number;
  };
  
  /** Building type(s) characteristics. */
  harvest?: IDependentHarvestBuildingType | ISelfSufficientHarvestBuildingType;
  // ... implement other types: production, research, military
}

/** A building that can be required to build, extend or upgrade another building, or train a unit. */
export interface IRequiredBuilding {
  /** The unique identifier of the required building. */
  code: string;
  
  /** The required upgrade level of the required building. */
  upgradeLevel?: number;
}

/** 
 * The extension level at which it is required to build the much-vauted required buildings.
 * */
interface IRequiredBuildingForExtensionLevel extends IRequiredBuilding {
  /** The extension level at which the building(s) is/are required. */
  level: number;
}

/**
 * The cost of instantiating, upgrading or extending a building.
 */
interface IBuildingCost extends IStaticEntityCost {
  /** Cost in plot. */
  plot: number;
}

/**
 * The representation of a harvest building (e.g. farm, goldmine, sawmill...).
 */
interface IHarvestBuildingType {
  /** Which resource is this building harvesting (gold, wood, food) ? */
  resource: string;
}

/**
 * A building that needs one or more worker(s) to harvest a specific resource.
 */
interface IDependentHarvestBuildingType extends IHarvestBuildingType {
  /** Maximum workforce on harvesting in this building. */
  maxWorkforce: number;
}

/**
 * A building that autonomously harvests a specific resource once (e.g. gives 3 food).
 */
interface ISelfSufficientHarvestBuildingType extends IHarvestBuildingType {
  /** What amount of resource is this building giving when it gets constructed ? */
  gift: number;
}