/**
 * Built by the user. Center of the game.
 */
export interface IGarrison {
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
  };

  
  /** Instances list. */
  instances: {
    /** Instantiated buildings. */
    buildings: {
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
          /** Assignment place (e.g. 'goldmine', 'sawmill'...). */
          code: string;

          /** Number of assigned units. */
          quantity: number;
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
interface IOperatedConstruction {
  /** When was the construction started ? */
  beginDate: Date;

  /** When did, or when will the construction end ? */
  endDate: Date;
  
  /** How many workers worked on this one ? */
  workforce: number;

  /** Improvement details. */
  improvement?: {
    /** Either 'upgrade' or 'extension'. */
    type: string;

    /** What was the upgrade/extension level to be built ? */
    level: number;
  }
}