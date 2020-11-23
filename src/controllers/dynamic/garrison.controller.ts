import { Request, Response, NextFunction } from 'express';

import GarrisonRepository from '../../repos/dynamic/garrison/garrison.repo';
import IGarrisonCreate from '../../config/models/data/garrison/payloads/IGarrisonCreate';
import IBuildingCreate from '../../config/models/data/garrison/payloads/IBuildingCreate';
import IBuildingUpgradeOrExtend from '../../config/models/data/garrison/payloads/IBuildingUpgradeOrExtend';
import IUnitCreate from '../../config/models/data/garrison/payloads/IUnitCreate';

import { ObjectId } from 'mongodb';
import { isValidObjectId } from 'mongoose';

import helper from '../../utils/helper.utils';

import ErrorHandler from '../../config/models/error/error-handler.model';

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

    // try to fetch it from dynamic
    const result = await this._repo.getFromUser(new ObjectId(req.params.userId));
    if (helper.isObjectEmpty(result)) // empty check because one cannot retrieve a null or undefined value
      throw new ErrorHandler(404, `Garrison from user '${req.params.userId}' couldn't be found.`);

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
}