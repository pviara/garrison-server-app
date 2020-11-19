import { ObjectId } from 'mongodb';

/**
 * Character creation payload.
 */
export default interface ICharacterCreate {
  userId: ObjectId;
  name: string;
  side: {
    faction: string;
    banner: string;
  };
}