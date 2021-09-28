import { ObjectId } from 'mongodb';

/**
 * Garrison unit training cancelation payload.
 */
export default interface IUnitTrainingCancel {
  garrisonId: ObjectId;
  code: string;
  seriesId: ObjectId;
}
