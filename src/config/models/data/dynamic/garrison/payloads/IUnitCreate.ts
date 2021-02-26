import { ObjectId } from 'mongodb';

/**
 * Garrison unit creation payload.
 */
export default interface IUnitCreate {
  garrisonId: ObjectId;
  code: string;
  quantity?: number;
}