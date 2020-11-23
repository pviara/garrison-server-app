import { ObjectId } from 'mongodb';

/**
 * Garrison building build payload.
 */
export default interface IBuildingCreate {
  garrisonId: ObjectId;
  code: string;
  workforce: number;
}