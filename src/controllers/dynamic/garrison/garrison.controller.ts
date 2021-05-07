import { Request, Response, NextFunction } from 'express';

import GarrisonRepository from '../../../repos/dynamic/garrison/garrison.repo';

import IBuildingConstructionCancel from '../../../config/models/data/dynamic/garrison/payloads/IBuildingConstructionCancel';
import IBuildingCreate from '../../../config/models/data/dynamic/garrison/payloads/IBuildingCreate';
import IBuildingUpgradeOrExtend from '../../../config/models/data/dynamic/garrison/payloads/IBuildingUpgradeOrExtend';

import IGarrisonCreate from '../../../config/models/data/dynamic/garrison/payloads/IGarrisonCreate';

import IResearchCancel from '../../../config/models/data/dynamic/garrison/payloads/IResearchCancel';
import IResearchCreate from '../../../config/models/data/dynamic/garrison/payloads/IResearchCreate';

import IUnitAssign from '../../../config/models/data/dynamic/garrison/payloads/IUnitAssign';
import IUnitCreate from '../../../config/models/data/dynamic/garrison/payloads/IUnitCreate';
import IUnitTrainingCancel from '../../../config/models/data/dynamic/garrison/payloads/IUnitTrainingCancel';

import { ObjectId } from 'mongodb';
import { isValidObjectId } from 'mongoose';

import helper from '../../../utils/helper.utils';

import ErrorHandler from '../../../config/models/error/error-handler.model';

export default class GarrisonController {
  constructor(private _repo: GarrisonRepository) {}

  /**
   * Get a specific garrison from dynamic database.
   * @param req Recevied client request.
   * @param res Response to send.
   * @param next Next express function (lifecycle).
   */
  async get(req: Request, res: Response, next: NextFunction) {
    if (helper.isObjectEmpty(req.params) || !req.params.userId)
      throw new ErrorHandler(400, 'Missing userId in params.');

    // check on param cast possibility
    const isValidId = isValidObjectId(req.params.userId);
    if (!isValidId) throw new ErrorHandler(400, `Unable to cast '${req.params.userId}' to ObjectId.`);

    // try to fetch it from dynamic user
    let result = null;
    try {
      result = await this._repo.getFromUser(new ObjectId(req.params.userId));
    } catch (e) {
      // try to fetch it from dynamic garrison
      result = await this._repo.findById(new ObjectId(req.params.userId));
    }
    if (!result) throw new ErrorHandler(404, `Garrison from userId/id ${req.params.userId} couldn't be found.`);

    // return it
    return result;
  }

  /**
   * Create a new garrison.
   * @param req Recevied client request.
   * @param res Response to send.
   * @param next Next express function (lifecycle).
   */
  async create(req: Request, res: Response, next: NextFunction) {
    if (!req.body
    || helper.isObjectEmpty(req.body)
    || !req.body.characterId
    || !req.body.zone
    || !req.body.name)
      throw new ErrorHandler(400, 'Missing entire body or one or a few mandatory fields.');

    // check on characterId cast possibility
    const isValidId = isValidObjectId(req.body.characterId);
    if (!isValidId) throw new ErrorHandler(400, `Unable to cast '${req.body.characterId}' to ObjectId.`);

    // launch creation process
    return await this._repo.create(<IGarrisonCreate>req.body);
  }

  /**
   * Add a new building to a specific garrison.
   * @param req Recevied client request.
   * @param res Response to send.
   * @param next Next express function (lifecycle).
   */
  async addBuilding(req: Request, res: Response, next: NextFunction) {
    if (!req.body
      || helper.isObjectEmpty(req.body)
      || !req.body.garrisonId
      || !req.body.code
      || !req.body.workforce)
        throw new ErrorHandler(400, 'Missing entire body or one or a few mandatory fields.');

    // check on garrisonId cast possibility
    const isValidId = isValidObjectId(req.body.garrisonId);
    if (!isValidId) throw new ErrorHandler(400, `Unable to cast '${req.body.garrisonId}' to ObjectId.`);

    // launch adding process
    return await this._repo.addBuilding(
      <IBuildingCreate>{
        ...req.body,
        garrisonId: new ObjectId(req.body.garrisonId)
    });
  }

  /**
   * Upgrade a specific building from a specific garrison.
   * @param req Recevied client request.
   * @param res Response to send.
   * @param next Next express function (lifecycle).
   */
  async upgradeBuilding(req: Request, res: Response, next: NextFunction) {
    if (!req.body
      || helper.isObjectEmpty(req.body)
      || !req.body.garrisonId
      || !req.body.buildingId
      || !req.body.workforce)
        throw new ErrorHandler(400, 'Missing entire body or one or a few mandatory fields.');

    // check on both garrisonId and buildingId cast possibility
    const isValidGarrisonId = isValidObjectId(req.body.garrisonId);
    const isValidBuildingId = isValidObjectId(req.body.buildingId);
    if (!isValidBuildingId || !isValidGarrisonId)
      throw new ErrorHandler(400, `Unable to cast either '${req.body.garrisonId}' or '${req.body.buildingId}' to ObjectId.`);

    // launch upgrade process
    return await this._repo.upgradeBuilding(
      <IBuildingUpgradeOrExtend>{
        ...req.body,
        garrisonId: new ObjectId(req.body.garrisonId),
        buildingId: new ObjectId(req.body.buildingId)
    });
  }

  /**
   * Extend a specific building from a specific garrison.
   * @param req Recevied client request.
   * @param res Response to send.
   * @param next Next express function (lifecycle).
   */
  async extendBuilding(req: Request, res: Response, next: NextFunction) {
    if (!req.body
      || helper.isObjectEmpty(req.body)
      || !req.body.garrisonId
      || !req.body.buildingId
      || !req.body.workforce)
        throw new ErrorHandler(400, 'Missing entire body or one or a few mandatory fields.');

    // check on both garrisonId and buildingId cast possibility
    const isValidGarrisonId = isValidObjectId(req.body.garrisonId);
    const isValidBuildingId = isValidObjectId(req.body.buildingId);
    if (!isValidBuildingId || !isValidGarrisonId)
      throw new ErrorHandler(400, `Unable to cast either '${req.body.garrisonId}' or '${req.body.buildingId}' to ObjectId.`);

    // launch extension process
    return await this._repo.extendBuilding(
      <IBuildingUpgradeOrExtend>{
        ...req.body,
        garrisonId: new ObjectId(req.body.garrisonId),
        buildingId: new ObjectId(req.body.buildingId)
    });
  }

  /**
   * Cancel a building construction.
   * @param req Recevied client request.
   * @param res Response to send.
   * @param next Next express function (lifecycle).
   */
  async cancelConstruction(req: Request, res: Response, next: NextFunction) {
    if (!req.body
      || helper.isObjectEmpty(req.body)
      || !req.body.garrisonId
      || !req.body.buildingId
      || !req.body.constructionId)
        throw new ErrorHandler(400, 'Missing entire body or one or a few mandatory fields.');

    // check on both garrisonId and buildingId cast possibility
    const isValidGarrisonId = isValidObjectId(req.body.garrisonId);
    const isValidBuildingId = isValidObjectId(req.body.buildingId);
    const isValidConstructionId = isValidObjectId(req.body.constructionId);
    if (!isValidBuildingId || !isValidGarrisonId || !isValidConstructionId)
      throw new ErrorHandler(
        400,
        `Unable to cast either '${req.body.garrisonId}', '${req.body.buildingId}' or '${req.body.constructionId}' to ObjectId.`
      );

    // launch extension process
    return await this._repo.cancelBuildingConstruction(
      <IBuildingConstructionCancel>{
        garrisonId: new ObjectId(req.body.garrisonId),
        buildingId: new ObjectId(req.body.buildingId),
        constructionId: new ObjectId(req.body.constructionId)
    });
  }

  /**
   * Add a new unit to a specific garrison.
   * @param req Recevied client request.
   * @param res Response to send.
   * @param next Next express function (lifecycle).
   */
  async addUnit(req: Request, res: Response, next: NextFunction) {
    if (!req.body
      || helper.isObjectEmpty(req.body)
      || !req.body.garrisonId
      || !req.body.code)
        throw new ErrorHandler(400, 'Missing entire body or one or a few mandatory fields.');

    // check on garrisonId cast possibility
    const isValidId = isValidObjectId(req.body.garrisonId);
    if (!isValidId) throw new ErrorHandler(400, `Unable to cast '${req.body.garrisonId}' to ObjectId.`);

    // launch adding process
    return await this._repo.addUnit(
      <IUnitCreate>{
        ...req.body,
        garrisonId: new ObjectId(req.body.garrisonId)
    });
  }

  async assignUnitRandomly(req: Request, res: Response, next: NextFunction) {
    if (!req.body
      || helper.isObjectEmpty(req.body)
      || !req.body.garrisonId
      || !req.body.code
      || !req.body.quantity
      || !req.body.harvestCode)
        throw new ErrorHandler(400, 'Missing entire body or one or a few mandatory fields.');
      
    // check on garrisonId cast possibility
    const isValidGarrisonId = isValidObjectId(req.body.garrisonId);
    if (!isValidGarrisonId)
      throw new ErrorHandler(400, `Unable to cast '${req.body.garrisonId}' to ObjectId.`);

    // launch adding process
    return await this._repo.assignUnitRandomly(
      <IUnitAssign>{
        ...req.body,
        garrisonId: new ObjectId(req.body.garrisonId)
    });
  }

  async unassignUnit(req: Request, res: Response, next: NextFunction) {
    if (!req.body
      || helper.isObjectEmpty(req.body)
      || !req.body.garrisonId
      || !req.body.code
      || !req.body.quantity
      || !req.body.harvestCode)
        throw new ErrorHandler(400, 'Missing entire body or one or a few mandatory fields.');
      
    // check on garrisonId cast possibility
    const isValidGarrisonId = isValidObjectId(req.body.garrisonId);
    if (!isValidGarrisonId)
      throw new ErrorHandler(400, `Unable to cast '${req.body.garrisonId}' to ObjectId.`);

    // launch adding process
    return await this._repo.unassignUnitRandomly(
      <IUnitAssign>{
        ...req.body,
        garrisonId: new ObjectId(req.body.garrisonId)
    });
  }

  /**
   * Cancel a unit training.
   * @param req Recevied client request.
   * @param res Response to send.
   * @param next Next express function (lifecycle).
   */
  async cancelUnitTraining(req: Request, res: Response, next: NextFunction) {
    if (!req.body
      || helper.isObjectEmpty(req.body)
      || !req.body.garrisonId
      || !req.body.code
      || !req.body.instantiationId)
        throw new ErrorHandler(400, 'Missing entire body or one or a few mandatory fields.');

    // check on both garrisonId and assignmentId cast possibility
    const isValidGarrisonId = isValidObjectId(req.body.garrisonId);
    const isValidAssignmentId = isValidObjectId(req.body.instantiationId);
    if (!isValidGarrisonId || !isValidAssignmentId)
      throw new ErrorHandler(
        400,
        `Unable to cast either '${req.body.garrisonId}' or '${req.body.instantiationId}' to ObjectId.`
      );

    // launch extension process
    return await this._repo.cancelUnitTraining(
      <IUnitTrainingCancel>{
        ...req.body,
        garrisonId: new ObjectId(req.body.garrisonId),
        instantiationId: new ObjectId(req.body.instantiationId)
      }
    );
  }

  /**
   * Launch a research.
   * @param req Recevied client request.
   * @param res Response to send.
   * @param next Next express function (lifecycle).
   */
  async launchResearch(req: Request, res: Response, next: NextFunction) {
    if (!req.body
      || helper.isObjectEmpty(req.body)
      || !req.body.garrisonId
      || !req.body.code
      || !req.body.workforce)
        throw new ErrorHandler(400, 'Missing entire body or one or a few mandatory fields.');

    // check on both garrisonId and assignmentId cast possibility
    const isValidGarrisonId = isValidObjectId(req.body.garrisonId);
    if (!isValidGarrisonId)
      throw new ErrorHandler(400, `Unable to cast '${req.body.garrisonId}' to ObjectId.`);

    return await this._repo.launchResearch(
      <IResearchCreate>{
        ...req.body,
        garrisonId: new ObjectId(req.body.garrisonId)
      }
    );
  }

  /**
   * Cancel a research.
   * @param req Recevied client request.
   * @param res Response to send.
   * @param next Next express function (lifecycle).
   */
  async cancelResearch(req: Request, res: Response, next: NextFunction) {
    if (!req.body
      || helper.isObjectEmpty(req.body)
      || !req.body.garrisonId
      || !req.body.projectId
      || !req.body.researchId)
      throw new ErrorHandler(400, 'Missing entire body or one or a few mandatory fields.');

    const isValidGarrisonId = isValidObjectId(req.body.garrisonId);
    const isValidResearchId = isValidObjectId(req.body.researchId);
    const isValidProjectId = isValidObjectId(req.body.projectId);
    if (!isValidResearchId || !isValidGarrisonId || !isValidProjectId)
      throw new ErrorHandler(
        400,
        `Unable to cast either '${req.body.garrisonId}', '${req.body.researchId}' or '${req.body.projectId}' to ObjectId.`
    );

    return await this._repo.cancelResearch(
      <IResearchCancel>{
        ...req.body,
        garrisonId: new ObjectId(req.body.garrisonId),
        researchId: new ObjectId(req.body.researchId),
        projectId: new ObjectId(req.body.projectId)
      }
    );
  }
}