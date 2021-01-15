import { Document, Model } from 'mongoose';

/**
 * A single static entity stored inside a collection of
 * entities sharing the same type.
 */
export interface IStaticEntity {
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

  /**
   * Entity description.
   */
  description?: string;
}

/**
 * The cost of instantiating the involved instantiable entity.
 */
export interface IStaticEntityCost {
  /** Cost in gold. */
  gold: number;

  /** Cost in wood. */
  wood: number;
}

/**
 * The representation of a static entity default statics.
 */
export interface IStaticEntityStatics {
  /**
   * Find a static entity by its code.
   * @param this Model to use to look into the right collection.
   * @param code Code to look for.
   */
  findByCode(this: Model<Document, {}>, code: string): Promise<IStaticEntity>;
}

/**
 * Find a static entity by its code.
 * @param this Model to use to look into the right collection.
 * @param code Code to look for.
 */
export async function findByCode(this: Model<Document, {}>, code: string) {
  return await this.findOne({ code });
}