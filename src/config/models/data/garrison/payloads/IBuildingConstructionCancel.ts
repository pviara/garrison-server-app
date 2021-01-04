import { ObjectId } from 'mongodb';

/**
 * Garrison building construction cancelation payload.
 */
export default interface IBuildingConstructionCancel {
  garrisonId: ObjectId;
  buildingId: ObjectId;
  constructionId: ObjectId;
}
