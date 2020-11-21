import { ObjectId } from 'mongodb';

/**
 * Garrison building build payload (can be instantiation, upgrade or even extension).
 */
export interface IBuildingCreate {
  garrisonId: ObjectId;
  code: string;
  workforce: number;
}