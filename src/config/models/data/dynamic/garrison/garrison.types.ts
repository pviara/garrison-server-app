import { ObjectId } from 'mongodb';
import { Document, Model } from 'mongoose';

/**
 * Represents a standard Garrison Document from database.
 * Includes both IGarrison and Document own fields.
 */
export interface IGarrisonDocument extends IGarrison, Document {}

/**
 * Represents a standard Garrison mongoose model.
 * Contains documents of type IGarrisonDocument.
 */
export interface IGarrisonModel extends Model<IGarrisonDocument> {}

/**
 * Built by the user. Center of the game.
 */
export interface IGarrison {
  /** Garrison's chief. */
  characterId: ObjectId;

  /** Garrison's name (e.g. 'The Old Retreat'). */
  name: string;
  
  /** Where is the garrison established ? */
  zone: string;

  /** Acquired resources. */
  resources: {
    gold: number;
    wood: number;
    food: number;
    plot: number;
    goldLastUpdate?: Date;
    woodLastUpdate?: Date;
  };
  
  /** Instances list. */
  instances: {
    /** Instantiated buildings. */
    buildings: {
      /** Building unique id. */
      _id?: ObjectId;

      /** Building unique identifier. */
      code: string;

      /** Building operated-constructions history. */
      constructions: IOperatedConstruction[];
    }[];

    /** Instantiated units. */
    units: {
      /** Unit's unique identifier. */
      code: string;

      /** Number of instances of this unit. */
      quantity: number;

      /** Units instances current state. */
      state: {
        /** Assignment list. */
        assignments: {
          /** Assignment unique id. */
          _id?: ObjectId;
          
          /** Assignment building. */
          buildingId?: ObjectId;

          /** Number of assigned units. */
          quantity: number;

          /** Assignement type. */
          type: 'instantiation' | 'construction' | 'harvest';

          /** End of assignment. */
          endDate: Date;
        }[];
      }
    }[];

    /** Researched upgrades. */
    researches: {
      /** Research unique identifier. */
      code: string;

      /** Research current level. */
      level?: number;
    }[];
  };
}

/**
 * The representation of a building operated-construction history.
 */
export interface IOperatedConstruction {
  /** Construction unique id. */
  _id: ObjectId;
  
  /** When was the construction started ? */
  beginDate: Date;

  /** When did, or when will the construction end ? */
  endDate: Date;
  
  /** How many workers worked on this one ? */
  workforce: number;

  /** Improvement details. */
  improvement?: {
    /** Either 'upgrade' or 'extension'. */
    type: 'upgrade' | 'extension';

    /** What was the upgrade/extension level to be built ? */
    level: number;
  }
}

/**
 * A building inside a Garrison.
 */
export type IGarrisonBuilding = IGarrisonDocument['instances']['buildings'][any];

/**
 * A unit inside a Garrison.
 */
export type IGarrisonUnit = IGarrisonDocument['instances']['units'][any];