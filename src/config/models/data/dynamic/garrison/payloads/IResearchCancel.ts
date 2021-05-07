import { ObjectId } from 'mongodb';

/**
 * Garrison research project cancelation payload.
 */
export default interface IResearchCancel {
  garrisonId: ObjectId;
  researchId: ObjectId;
  projectId: ObjectId;
}
