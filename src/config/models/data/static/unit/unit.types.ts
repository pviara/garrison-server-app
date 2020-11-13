import { Document, Model } from 'mongoose';

import { IStaticEntity, IStaticEntityCost, IStaticEntityStatics } from '../static.types';

import { IRequiredBuilding } from '../building/building.types';

/**
 * Represents a standard Unit Document from database.
 * Includes both IUnit and Document own fields.
 */
export interface IUnitDocument extends IUnit, Document {}

/**
 * Represents a standard Unit mongoose model.
 * Contains documents of type IUnitDocument.
 */
export interface IUnitModel extends Model<IUnitDocument>, IStaticEntityStatics {}

/**
 * The representation of a unit.
 */
export interface IUnit extends IStaticEntity {
  /** Instantiation requirements and characteristics. */
  instantiation: {
    /** In which building is this unit being instantiated ? */
    building: string;
    cost: IUnitCost;
    duration: number;
    requiredEntities?: IRequiredBuilding | IRequiredBuilding[];
  };

  /** Global statistics. */
  statistics: {
    type: {
      /** Unit type(s) : worker, explorer, fighter. */
      main: string | string[];

      /** How does the unit fight ? Melee ? Distance ? */
      fight?: string | string[];
    };
    
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
interface IUnitCost extends IStaticEntityCost {
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