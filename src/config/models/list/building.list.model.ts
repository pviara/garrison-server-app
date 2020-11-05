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

/**
 * The representation of a building inside the building list dataset.
 */
interface IBuildingListDataEntity extends IListDataEntity {
  /** Building type(s) : production, harvest, military, research. */
  types: string | string[];

  /** Instantiation requirements and characteristics. */
  instantation: {
    cost: IBuildingCost;
    minWorkforce: number;
    duration: number;
    requiredBuildings?: IRequiredBuilding | IRequiredBuilding[];
  };

  /** Upgrades list. */
  upgrades?: {
    level: number;
    word: string | {
      side: string;
      jargon: string;
    }[];
    requiredBuildings?: IRequiredBuilding | IRequiredBuilding[];
  }[];

  /** Extension characteristics. */
  extension?: {
    /** Requirements. */
    requiredBuildings?: IRequiredBuildingForExtensionLevel | IRequiredBuildingForExtensionLevel[];

    /** Maximum extension level. */
    maxLevel?: number;
  };

  /** Harvest building characteristics. */
  harvest?: IBuildingHarvest | IBuildingDependantHarvest | IBuildingSelfSufficientHarvest;
}

/** A building that can be required to build, extend or upgrade another building. */
interface IRequiredBuilding {
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

/** The extension level at which it is required to build the much-vauted required buildings. */
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
interface IBuildingHarvest {
  /** Which resource is this building harvesting (gold, wood, food) ? */
  resource: string;
}

/**
 * A building that needs one or more worker(s) to harvest a specific resource.
 */
interface IBuildingDependantHarvest extends IBuildingHarvest {
  /** Maximum workforce on harvesting in this building. */
  maxWorkforce: number;
}

/**
 * A building that autonomously harvests a specific resource once (e.g. gives 3 food).
 */
interface IBuildingSelfSufficientHarvest extends IBuildingHarvest {
  /** What amount of resource is this building giving when it gets constructed ? */
  gift: number;
}