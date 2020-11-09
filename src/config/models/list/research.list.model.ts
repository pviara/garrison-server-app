import {
  IList,
  IListDataEntity,
  IListDataEntityCost
} from './model';

import { IRequiredBuilding } from './building.list.model';

/**
 * The representation of a list of researches.
 */
export interface IResearchList extends IList {
  dataset: IResearchListDataEntity[];
}

/**
 * The representation of a research inside the research list dataset.
 */
interface IResearchListDataEntity extends IListDataEntity {
  /** Instantiation requirements and characteristics. */
  instantiation: {
    cost: IListDataEntityCost,
    duration: number;
    required?: IRequiredBuilding | IRequiredBuilding[];
  };

  target: {
    /** Type of the affected target (e.g. unit or building). */
    entity: string;
  
    /** Code, type or subtype of the affected unit or building */
    identifier: string | {
      fightType: string;
    };
  }

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