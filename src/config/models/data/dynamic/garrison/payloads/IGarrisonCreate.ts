import { ObjectId } from 'mongodb';

/**
 * Garrison creation payload.
 */
export default interface IGarrisonCreate {
  characterId: ObjectId;
  zone: string;
  name: string;
}