import { ObjectId } from 'mongodb';

/**
 * Garrison creation payload.
 */
export default interface ICharacterCreate {
  characterId: ObjectId;
  zone: string;
  name: string;
}