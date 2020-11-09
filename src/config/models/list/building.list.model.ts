import {
  IList,
  IListDataEntity,
  IListDataEntityCost
} from './model';
  
/**
 * The representation of a list of buildings. 
 */
export interface IBuildingList extends IList {
  dataset: IBuildingListDataEntity[];
}

/** A building that can be required to build, extend or upgrade another building, or train a unit. */
export interface IRequiredBuilding {
  /** The one or more required buildings. */
  buildings: {
    /** The unique identifier of the required building. */
    code: string;
    
    /** The required upgrade level of the required building. */
    upgradeLevel?: number;
  } | {
    /** The unique identifier of the required building. */
    code: string;
    
    /** The required upgrade level of the required building. */
    upgradeLevel?: number;
  }[];
}

/**
 * The representation of a building inside the building list dataset.
 */
interface IBuildingListDataEntity extends IListDataEntity {
  /** Instantiation requirements and characteristics. */
  instantation: {
    cost: IBuildingCost;
    minWorkforce: number;
    duration: number;
    required?: IRequiredBuilding | IRequiredBuilding[];
  };
  
  /** Upgrades list. */
  upgrades?: {
    level: number;
    word: string | {
      side: string;
      jargon: string;
    }[];
    required?: IRequiredBuilding | IRequiredBuilding[];
  }[];
  
  /** Extension characteristics. */
  extension?: {
    /** Requirements. */
    required?: IRequiredBuildingForExtensionLevel | IRequiredBuildingForExtensionLevel[];
    
    /** Maximum extension level. */
    maxLevel?: number;
  };
  
  /** Building type(s) characteristics. */
  types: {
    harvest?: IDependentHarvestBuildingType | ISelfSufficientHarvestBuildingType;
    // ... implement other types: production, research, military
  }
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
interface IBuildingCost extends IListDataEntityCost {
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