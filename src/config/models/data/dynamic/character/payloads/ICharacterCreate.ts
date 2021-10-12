import { ObjectId } from 'mongodb';

/**
 * Character creation payload.
 */
export default interface ICharacterCreate {
  userId: ObjectId;
  name: string;
  gender: 'male' | 'female';
  side: {
    faction: string;
    banner: string;
  };
}