import { ObjectId } from 'mongodb';

/**
 * Garrison unit assignment payload.
 */
export default interface IUnitAssign {
  garrisonId: ObjectId;
  code: string;
  quantity: number;
  harvestCode: 'goldmine' | 'sawmill';
}