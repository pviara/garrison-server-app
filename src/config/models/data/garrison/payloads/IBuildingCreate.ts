import { ObjectId } from 'mongodb';

/**
 * Garrison building build payload.
 */
export interface IBuildingCreate {
  garrisonId: ObjectId;
  code: string;
  workforce: number;
}