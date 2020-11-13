import { Document, Model } from 'mongoose';

import { IStaticEntity } from '../types';

/**
 * Represents a standard Zone Document from database.
 * Includes both IZone and Document own fields.
 */
export interface IZoneDocument extends IZone, Document {}

/**
 * Represents a standard Zone mongoose model.
 * Contains documents of type IZoneDocument.
 */
export interface IZoneModel extends Model<IZoneDocument> {}

/**
 * The representation of a zone.
 */
export interface IZone extends IStaticEntity {
  /** In other words : faction (like the *horde* or the *alliance*). */
  side: string;

  /** Cartesian coordinates. */
  coordinates: {
    x: number;
    y: number;
  }
}