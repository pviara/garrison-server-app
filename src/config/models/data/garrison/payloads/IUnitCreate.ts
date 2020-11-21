import { ObjectId } from 'mongodb';

/**
 * Garrison unit creation payload.
 */
export interface IUnitCreate {
  garrisonId: ObjectId;
  code: string;
  quantity?: number;
}