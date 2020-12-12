import { ObjectId } from 'mongodb';

/**
 * Garrison unit unassignment payload.
 */
export default interface IUnitUnassign {
  garrisonId: ObjectId;
  buildingId: ObjectId;
  code: string;
  quantity?: number;
}