import { Document, Model } from 'mongoose';

import { IStaticEntity } from '../static.types';

/**
 * Represents a standard Banner Document from database.
 * Includes both IBanner and Document own fields.
 */
export interface IBannerDocument extends IBanner, Document {}

/**
 * Represents a standard Banner mongoose model.
 * Contains documents of type IBannerDocument.
 */
export interface IBannerModel extends Model<IBannerDocument> {}

/**
 * The representation of a banner.
 */
export interface IBanner extends IStaticEntity {
  /** In other words : faction (like the *horde* or the *alliance*). */
  side: string;
}