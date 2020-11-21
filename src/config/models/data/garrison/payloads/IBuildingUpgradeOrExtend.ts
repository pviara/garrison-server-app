import { ObjectId } from 'mongodb';

/**
 * Garrison building upgrade/extension payload.
 */
export interface IBuildingUpgradeOrExtend {
  garrisonId: ObjectId;
  buildingId: ObjectId;
  workforce: number;
}