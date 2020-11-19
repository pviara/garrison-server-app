import { ObjectId } from 'mongodb';
import { Document, Model } from 'mongoose';

/**
 * Represents a standard Character Document from database.
 * Includes both ICharacter and Document own fields.
 */
export interface ICharacterDocument extends ICharacter, Document {}

/**
 * Represents a standard Character mongoose model.
 * Contains documents of type ICharacterDocument.
 */
export interface ICharacterModel extends Model<ICharacterDocument> {}

/**
 * The representation of a character.
 */
export interface ICharacter {
  /** Character's owner. */
  userId: ObjectId;
  
  /** Character's name. */
  name: string;

  /** Player's side details. */
  side: {
    /** The faction whose player belongs to. */
    faction: string;

    /** The banner whose player belongs to. */
    banner: string;
  };
}