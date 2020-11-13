import { Document, Model } from 'mongoose';

import { IStaticEntity } from '../static.types';

/**
 * Represents a standard Faction Document from database.
 * Includes both IFaction and Document own fields.
 */
export interface IFactionDocument extends IFaction, Document {}

/**
 * Represents a standard Faction mongoose model.
 * Contains documents of type IFactionDocument.
 */
export interface IFactionModel extends Model<IFactionDocument> {}

/**
 * The representation of a faction.
 */
export interface IFaction extends IStaticEntity {}