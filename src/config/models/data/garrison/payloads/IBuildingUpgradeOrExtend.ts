import { ObjectId } from 'mongodb';

/**
 * Garrison building upgrade/extension payload.
 */
export default interface IBuildingUpgradeOrExtend {
  garrisonId: ObjectId;
  buildingId: ObjectId;
  workforce: number;
}