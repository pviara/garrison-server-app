import { Document, Model } from 'mongoose';
import { ObjectId } from 'mongodb';

/**
 * Represents a standard Record Document from database.
 * Inclues both IRecord and Document own fields.
 */
export interface IRecordDocument extends IRecord, Document {}

/**
 * Represents a standard Record mongoose model.
 * Contains documents of type IRecordDocument.
 */
export interface IRecordModel extends Model<IRecordDocument> {}

/**
 * The representation of a game record.
 */
export interface IRecord {
  garrisonId: ObjectId;
  moment: Date;
  entity: 'building' | 'research' | 'unit';
  quantity?: number;
  action: 'assignment' | 'cancelation' | 'instantiation' | 'unassignment';
  resources?: {
    gold: number;
    wood: number;
    food?: number;
    plot?: number;
  };
}