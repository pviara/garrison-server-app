import { IDocument } from '../model';

/**
 * A set of static data that all share the same type
 * (e.g. a list of *buildings*, a list of *units*, a list of *banners*...).
 */
export interface IList extends IDocument {
  /** Both unique identifier **and** keyword. Uppercase. Plural if can be. */
  type: string;

  /** Much-vaunted set of static data. */
  dataset: IListDataEntity[];
}

/**
 * A single static entity stored inside a list dataset.
 */
export interface IListDataEntity {
  /** Unique identifier. */
  code: string;

  /**
   * Display text. Can be a single word or a set of words (jargon) displayed
   * in accordance with the reader's faction (side).
   */
  word: string | {
    side: string;
    jargon: string;
  }[];

  /** Display picture(s). If exist(s), the icon is always mandatory. */
  pictures?: {
    icon: string;
    image?: string;
  };
}

/**
 * The cost of instantiating the involved instantiable entity.
 */
export interface IListDataEntityCost {
  /** Cost in gold. */
  gold: number;

  /** Cost in wood. */
  wood: number;
}