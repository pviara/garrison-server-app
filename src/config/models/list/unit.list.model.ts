import {
  IList,
  IListDataEntity,
  IListDataEntityCost
} from './model';

import { IRequiredBuilding } from './building.list.model';

/**
 * The representation of a list of units.
 */
export interface IUnitList extends IList {
  dataset: IUnitDataEntity[];
}

/**
 * The representation of a unit inside the unit list dataset.
 */
interface IUnitDataEntity extends IListDataEntity {
  /** Instantiation requirements and characteristics. */
  instantiation: {
    /** In which building is this unit being instantiated ? */
    building: string;
    cost: IUnitCost;
    duration: number;
    required?: IRequiredBuilding | IRequiredBuilding[];
  };

  /** Global statistics. */
  statistics: {
    type: {
      /** Unit type(s) : worker, explorer, fighter. */
      main: string | string[];

      /** How does the unit fight ? Melee ? Distance ? */
      fight?: string | string[];
    }
    
    /** Health points. */
    health: number;

    /** Attack statistics. */
    attack?: IUnitStatistic;

    /** Defense statistics. */
    defense?: IUnitStatistic;
  }
}

/**
 * The cost of instantiating a unit.
 */
interface IUnitCost extends IListDataEntityCost {
  /** Cost in food. */
  food: number;
}

/**
 * The representation of unit's statistics. 
 */
interface IUnitStatistic {
  /** The damage being inflicted to/taken from the ennemy unit. */
  points: {
    /** Minimum damage/defense points. */
    min: number;

    /** Maximum damage/defense points. */
    max: number;
  };

  /** The time between two hits/parades. */
  cooldown: number;

  /** Can the unit hit or defense itself against ennemy air units ? */
  isDistance: boolean;
}