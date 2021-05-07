import { ObjectId } from 'mongodb';

/**
 * Garrison research start payload.
 */
export default interface IResearchCreate {
  garrisonId: ObjectId;
  code: string;
  workforce: number;
}