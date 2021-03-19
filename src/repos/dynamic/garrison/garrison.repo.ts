import ErrorHandler from '../../../config/models/error/error-handler.model';

import {
  ELogType as logType
} from '../../../config/models/log/log.model';
import IMonitored from '../../../config/models/IMonitored';
import MonitoringService from '../../../config/services/monitoring/monitoring.service'

import {
  ObjectId
} from 'mongodb';

import {
  IBuilding
} from '../../../config/models/data/static/building/building.types';
import IBuildingConstructionCancel from '../../../config/models/data/dynamic/garrison/payloads/IBuildingConstructionCancel';
import IBuildingCreate from '../../../config/models/data/dynamic/garrison/payloads/IBuildingCreate';
import IBuildingUpgradeOrExtend from '../../../config/models/data/dynamic/garrison/payloads/IBuildingUpgradeOrExtend';

import {
  IGarrisonBuilding,
  IGarrisonDocument,
  IGarrisonModel,
  IOperatedConstruction,
  IUnitAssignment
} from '../../../config/models/data/dynamic/garrison/garrison.types';
import IGarrisonCreate from '../../../config/models/data/dynamic/garrison/payloads/IGarrisonCreate';

import {
  IUnit
} from '../../../config/models/data/static/unit/unit.types';
import IUnitAssign from '../../../config/models/data/dynamic/garrison/payloads/IUnitAssign';
import IUnitCreate from '../../../config/models/data/dynamic/garrison/payloads/IUnitCreate';
import IUnitUnassign from '../../../config/models/data/dynamic/garrison/payloads/IUnitUnassign';

import {
  IZone
} from '../../../config/models/data/static/zone/zone.types'

import BuildingRepository from '../../static/building.repo';
import CharacterRepository from '../character/character.repo';
import UnitRepository from '../../static/unit.repo';
import UserRepository from '../user/user.repo';
import ZoneRepository from '../../static/zone.repo';

import _h from '../../../utils/helper.utils';
import _gH from './utils/helper.utils.garrison.repo';

export default class GarrisonRepository implements IMonitored {
  private _monitor = new MonitoringService(this.constructor.name);

  /** Retrieve class monitoring service. */
  get monitor() {
    return this._monitor;
  }

  constructor(
    private _model: IGarrisonModel,
    private _buildingRepo: BuildingRepository,
    private _characterRepo: CharacterRepository,
    private _unitRepo: UnitRepository,
    private _userRepo: UserRepository,
    private _zoneRepo: ZoneRepository
  ) {
    this._monitor.log(logType.pass, 'Initialized garrison repository');
  }

  /**
   * Find a garrison by its id.
   * @param id Given ObjectId.
   * @param strict Sets whether an error is thrown when no garrison is found.
   * @returns Either an IGarrisonDocument or (maybe) null if strict mode is set to false.
   */
  async findById(id: ObjectId, strict ? : true): Promise < IGarrisonDocument > ;
  async findById(id: ObjectId, strict: false): Promise < IGarrisonDocument | null > ;
  async findById(id: ObjectId, strict ? : boolean) {
    const result = await this._model.findById(id);
    if (!result && strict) throw new ErrorHandler(404, `Garrison with garrisonId '${id}' couldn't be found.`);

    return result;
  }

  /**
   * Get a garrison from a user's id.
   * @param userId Given ObjectId.
   * @param strict Sets whether an error is thrown when no garrison is found.
   * @returns Either an IGarrisonDocument or (maybe) null if strict mode is set to false.
   */
  async getFromUser(userId: ObjectId, strict ? : true): Promise < IGarrisonDocument > ;
  async getFromUser(userId: ObjectId, strict: false): Promise < IGarrisonDocument | null > ;
  async getFromUser(userId: ObjectId, strict ? : boolean) {
    const user = await this._userRepo.findById(userId);
    const character = await this._characterRepo.getFromUser(user?._id);

    const result = await this.getFromCharacter(character?._id);
    if (!result && strict) throw new ErrorHandler(404, `Garrison from userId '${userId}' couldn't be found.`);

    return result;
  }

  /**
   * Get a garrison from a character's id.
   * @param userId Given ObjectId.
   * @param strict Sets whether an error is thrown when no garrison is found.
   * @returns Either an IGarrisonDocument or (maybe) null if strict mode is set to false.
   */
  async getFromCharacter(characterId: ObjectId, strict ? : true): Promise < IGarrisonDocument > ;
  async getFromCharacter(characterId: ObjectId, strict: false): Promise < IGarrisonDocument | null > ;
  async getFromCharacter(characterId: ObjectId, strict ? : boolean) {
    const result = await this._model.findOne({
      characterId
    });
    if (!result && strict) throw new ErrorHandler(404, `Garrison from characterId '${characterId}' couldn't be found.`);

    return result;
  }

  /**
   * Create and save a new garrison in database.
   * @param payload @see IGarrisonCreate
   */
  async create(payload: IGarrisonCreate) {
    const characterGarrison = await this.getFromCharacter(payload.characterId, false);
    if (characterGarrison && _h.areSameString(characterGarrison.name, payload.name)) {
      throw new ErrorHandler(409, `Already existing garrison with name '${payload.name}'.`);
    }

    const character = await this._characterRepo.findById(payload.characterId);
    const zone = await this._zoneRepo.findByCode(payload.zone) as IZone;

    // check if given zone is compliant with character's faction
    if (!_h.areSameString(zone.side, character?.side.faction || ''))
      throw new ErrorHandler(400, `Selected zone (${payload.zone}) is not compliant with character\`s faction (${character?.side.faction}).`);

    // create the garrison with default values
    return await this._model.create({
      characterId: payload.characterId,
      name: payload.name,
      zone: payload.zone,
      resources: {
        gold: 625,
        wood: 320,
        food: 3,
        plot: 32
      },
      instances: {
        buildings: [],
        researches: [],
        units: [{
          code: 'peasant',
          quantity: 3,
          state: {
            assignments: []
          }
        }]
      }
    });
  }

  /**
   * Add and save a new building.
   * @param payload @see IBuildingCreate
   */
  async addBuilding(payload: IBuildingCreate) {
    // ⌚ init the moment
    const now = new Date();

    //////////////////////////////////////////////

    // ❔ make the checks
    const garrison = await this.findById(payload.garrisonId);
    const staticBuilding = await this._buildingRepo.findByCode(payload.code) as IBuilding;

    const {
      unit: peasants
    } = _gH.findUnit(garrison, 'peasant');
    _gH.checkWorkforceCoherence(
      now,
      payload.workforce,
      peasants,
      staticBuilding
    );

    const {
      requiredEntities
    } = staticBuilding.instantiation;
    if (requiredEntities) {
      _gH.checkStandardRequirements(
        now,
        requiredEntities.buildings,
        garrison.instances.buildings
      );
    }

    //////////////////////////////////////////////

    // 🔨 prepare to build! 
    const {
      duration
    } = _gH
      .computeConstructionDurationAndWorkforce(
        payload.workforce,
        staticBuilding
      );

    const construction: IOperatedConstruction = {
      _id: new ObjectId(),
      beginDate: now,
      endDate: _h.addTime(now, duration * 1000),
      workforce: payload.workforce
    };

    const buildingId = new ObjectId();
    garrison.instances.buildings = [
      ...garrison.instances.buildings,
      {
        _id: buildingId,
        code: payload.code,
        constructions: [construction]
      }
    ];

    //////////////////////////////////////////////

    // 💰 update the resources
    garrison.resources = (await this._updateResources(garrison)).resources;
    garrison.resources = _gH
      .checkConstructionPaymentCapacity(
        now,
        garrison.resources,
        staticBuilding.instantiation.cost
      );

    // 💰 "gift-harvest" type of buildings directly give their resource here,
    if (staticBuilding.harvest && !staticBuilding.harvest.maxWorkforce)
      garrison.resources[staticBuilding.harvest.resource] += staticBuilding.harvest.amount;

    // 👨‍💼 assign peasants to building-site
    peasants.state.assignments = [
      ...peasants.state.assignments,
      {
        _id: new ObjectId(),
        buildingId,
        quantity: payload.workforce,
        type: 'construction',
        endDate: _h.addTime(now, duration * 1000)
      }
    ];

    //////////////////////////////////////////////

    // 💾 save in database
    garrison.markModified('instances.buildings');
    garrison.markModified('instances.units');
    await garrison.save();

    return await this.findById(garrison._id);
  }

  /**
   * Cancel an ongoing building construction.
   * @param payload @see IBuildingConstructionCancel
   */
  async cancelBuildingConstruction(payload: IBuildingConstructionCancel) {
    // ❔ make the checks
    const garrison = await this.findById(payload.garrisonId);
    const {
      building,
      index: bIndex
    } = _gH.findBuilding(garrison, payload.buildingId);
    const staticBuilding = await this._buildingRepo.findByCode(building.code) as IBuilding;

    const {
      index: cIndex
    } = _gH
      .findBuildingConstruction(
        building,
        payload.constructionId
      );

    //////////////////////////////////////////////

    // 💰 prepare to refund!
    let {
      gold,
      wood,
      plot
    } = staticBuilding.instantiation.cost;

    const {
      improvement
    } = building.constructions[cIndex];
    if (improvement) {
      gold = gold * Math.pow(_gH.getFactor('default'), improvement.level);
      wood = wood * Math.pow(_gH.getFactor('default'), improvement.level);
      plot = plot * Math.pow(_gH.getFactor('decreased'), improvement.level);

      building
        .constructions
        .splice(cIndex, 1);
    } else {
      garrison
        .instances
        .buildings
        .splice(bIndex, 1);
    }

    garrison.resources = {
      ...garrison.resources,
      gold: garrison.resources.gold + gold,
      wood: garrison.resources.wood + wood,
      plot: garrison.resources.plot + plot,
    };

    const {
      harvest,
      code
    } = staticBuilding;
    if (harvest) {
      const checkBuildingStillExists = (buildings: IGarrisonBuilding[], code: string) => {
        return buildings
          .some(b => b.code === code);
      };

      switch (typeof harvest.maxWorkforce) {
        case 'number':
          if (checkBuildingStillExists(garrison.instances.buildings, code))
            delete garrison.resources[`${harvest.resource}LastUpdate` as 'goldLastUpdate' | 'woodLastUpdate'];
          break;

        case undefined:
          const owed = Math.floor(
            harvest.amount * Math.pow(_gH.getFactor('decreased'), improvement?.level || 1)
          );
          const rest = garrison.resources[harvest.resource] - owed;
          garrison.resources[harvest.resource] = rest >= 0 ? rest : 0;
          break;
      }
    }

    //////////////////////////////////////////////

    // 👨‍💼 unassign peasants from building-site
    const {
      unit: peasants
    } = _gH.findUnit(garrison, 'peasant');
    const aIndex = peasants
      .state
      .assignments
      .findIndex(a => a.endDate.getTime() === building.constructions[cIndex]?.endDate.getTime());

    peasants
      .state
      .assignments
      .splice(aIndex, 1);

    //////////////////////////////////////////////

    // 💾 save in database
    garrison.markModified('instances.buildings');
    garrison.markModified('instances.units');
    await garrison.save();

    return await this.findById(garrison._id);
  }

  /**
   * Upgrade and save an existing building.
   * @param payload @see IBuildingUpgradeOrExtend
   */
  async upgradeBuilding(payload: IBuildingUpgradeOrExtend) {
    // ⌚ init the moment
    const now = new Date();

    //////////////////////////////////////////////

    // ❔ make the checks
    const garrison = await this.findById(payload.garrisonId);
    const {
      building
    } = _gH.findBuilding(garrison, payload.buildingId);
    const staticBuilding = await this._buildingRepo.findByCode(building.code) as IBuilding;

    _gH.checkBuildingAvailability(now, building);

    const {
      nextUpgrade
    } = _gH
      .checkBuildingImprovable(
        now,
        building,
        staticBuilding,
        'upgrade'
      );

    const {
      requiredEntities
    } = nextUpgrade;
    if (requiredEntities) {
      _gH.checkStandardRequirements(
        now,
        requiredEntities.buildings,
        garrison.instances.buildings
      );
    }

    const {
      duration
    } = _gH
      .computeConstructionDurationAndWorkforce(
        payload.workforce,
        staticBuilding,
        nextUpgrade.level
      );

    const {
      unit: peasants
    } = _gH.findUnit(garrison, 'peasant');
    _gH.checkWorkforceCoherence(
      now,
      payload.workforce,
      peasants,
      staticBuilding,
      'upgrade',
      building.constructions
    );

    //////////////////////////////////////////////

    // 🔨 prepare to build! 
    const construction: IOperatedConstruction = {
      _id: new ObjectId(),
      beginDate: now,
      endDate: _h.addTime(now, duration * 1000),
      workforce: payload.workforce,
      improvement: {
        type: 'upgrade',
        level: nextUpgrade.level
      }
    };

    building.constructions = [
      ...building.constructions,
      construction
    ];

    //////////////////////////////////////////////

    // 💰 update the resources
    garrison.resources = (await this._updateResources(garrison)).resources;
    garrison.resources = _gH
      .checkConstructionPaymentCapacity(
        now,
        garrison.resources,
        staticBuilding.instantiation.cost,
        'upgrade',
        building.constructions
      );

    // 💰 "gift-harvest" type of buildings directly give their resource here,
    if (staticBuilding.harvest && !staticBuilding.harvest.maxWorkforce)
      garrison.resources[staticBuilding.harvest.resource] += Math.floor(
        staticBuilding.harvest.amount * Math.pow(1.2, nextUpgrade.level)
      );

    //////////////////////////////////////////////

    // 👨‍💼 assign peasants to building-site
    peasants.state.assignments = [
      ...peasants.state.assignments,
      {
        _id: new ObjectId(),
        buildingId: < ObjectId > building._id,
        quantity: payload.workforce,
        type: 'construction',
        endDate: _h.addTime(now, duration * 1000)
      }
    ];

    //////////////////////////////////////////////

    // 💾 save in database
    garrison.markModified('instances.buildings');
    garrison.markModified('instances.units');
    await garrison.save();

    return await this.findById(garrison._id);
  }

  /**
   * Extend and save an existing building.
   * @param payload @see IBuildingUpgradeOrExtend
   */
  async extendBuilding(payload: IBuildingUpgradeOrExtend) {
    // ⌚ init the moment
    const now = new Date();

    //////////////////////////////////////////////

    // ❔ make the checks
    const garrison = await this.findById(payload.garrisonId);
    const {
      building
    } = _gH.findBuilding(garrison, payload.buildingId);
    const staticBuilding = await this._buildingRepo.findByCode(building.code) as IBuilding;

    _gH.checkBuildingAvailability(now, building);

    const {
      extension,
      nextExtension
    } = _gH
      .checkBuildingImprovable(
        now,
        building,
        staticBuilding,
        'extension'
      );

    const {
      requiredEntities
    } = extension;
    if (requiredEntities) {
      _gH.checkExtensionConstructionRequirements(
        now,
        requiredEntities.buildings,
        garrison.instances.buildings,
        nextExtension
      );
    }

    const {
      duration
    } = _gH
      .computeConstructionDurationAndWorkforce(
        payload.workforce,
        staticBuilding,
        nextExtension
      );

    const {
      unit: peasants
    } = _gH.findUnit(garrison, 'peasant');
    _gH.checkWorkforceCoherence(
      now,
      payload.workforce,
      peasants,
      staticBuilding,
      'upgrade',
      building.constructions
    );

    //////////////////////////////////////////////

    // 🔨 prepare to build!
    const construction: IOperatedConstruction = {
      _id: new ObjectId(),
      beginDate: now,
      endDate: _h.addTime(now, duration * 1000),
      workforce: payload.workforce,
      improvement: {
        type: 'extension',
        level: nextExtension
      }
    };

    building.constructions = [
      ...building.constructions,
      construction
    ];

    //////////////////////////////////////////////

    // 💰 update the resources
    garrison.resources = (await this._updateResources(garrison)).resources;
    garrison.resources = _gH
      .checkConstructionPaymentCapacity(
        now,
        garrison.resources,
        staticBuilding.instantiation.cost,
        'extension',
        building.constructions
      );

    // 💰 "gift-harvest" type of buildings directly give their resource here,
    if (staticBuilding.harvest && !staticBuilding.harvest.maxWorkforce)
      garrison.resources[staticBuilding.harvest.resource] += Math.floor(
        staticBuilding.harvest.amount * Math.pow(1.2, nextExtension)
      );

    //////////////////////////////////////////////

    // 👨‍💼 assign peasants to building-site
    peasants.state.assignments = [
      ...peasants.state.assignments,
      {
        _id: new ObjectId(),
        buildingId: < ObjectId > building._id,
        quantity: payload.workforce,
        type: 'construction',
        endDate: _h.addTime(now, duration * 1000)
      }
    ];

    //////////////////////////////////////////////

    // 💾 save in database
    garrison.markModified('instances.buildings');
    garrison.markModified('instances.units');
    await garrison.save();

    return await this.findById(garrison._id);
  }

  /**
   * Add and save a new unit.
   * @param payload @see IUnitCreate
   */
  async addUnit(payload: IUnitCreate) {
    // ⌚ init the moment
    const now = new Date();

    //////////////////////////////////////////////

    // ❔ make the checks
    const garrison = await this.findById(payload.garrisonId);
    const staticUnit = await this._unitRepo.findByCode(payload.code) as IUnit;

    const {
      requiredEntities
    } = staticUnit.instantiation;
    if (requiredEntities) {
      _gH.checkStandardRequirements(
        now,
        requiredEntities.buildings,
        garrison.instances.buildings
      );
    }

    // 👨‍💼 prepare to train!
    const assignments: IUnitAssignment[] = [];
    for (let i = 0; i < (payload.quantity || 1); i++) {
      assignments.push({
        _id: new ObjectId(),
        quantity: 1,
        type: 'instantiation',
        endDate: _h.addTime(
          assignments[i - 1]?.endDate || now,
          staticUnit.instantiation.duration * 1000
        )
      });
    }

    const newUnit = {
      code: staticUnit.code,
      quantity: payload.quantity || 1,
      state: {
        assignments
      }
    };

    const unit = _gH.findUnit(garrison, newUnit.code, false);
    if (!unit) {
      garrison.instances.units = [
        ...garrison.instances.units,
        newUnit
      ];
    } else {
      const {
        index
      } = unit;
      garrison.instances.units[index] = {
        code: garrison.instances.units[index].code,
        quantity: garrison.instances.units[index].quantity + newUnit.quantity,
        state: {
          assignments: garrison
            .instances
            .units[index]
            .state
            .assignments
            .concat(newUnit.state.assignments)
        }
      };
    }

    //////////////////////////////////////////////

    // 💰 update the resources
    garrison.resources = (await this._updateResources(garrison)).resources;
    garrison.resources = _gH
      .checkTrainingPaymentCapacity(
        garrison.resources,
        staticUnit.instantiation.cost,
        payload.quantity || 1
      );

    //////////////////////////////////////////////

    // 💾 save in database
    garrison.markModified('instances.units');
    await garrison.save();

    return await this.findById(garrison._id);
  }

  /**
   * Assign a unit (peasant) at a (harvest) building.
   * @param payload @see IUnitAssign
   */
  async assignUnit(payload: IUnitAssign) {
    // ⌚ init the moment
    const now = new Date();

    //////////////////////////////////////////////

    // ❔ make the checks
    const garrison = await this.findById(payload.garrisonId);
    const {
      building
    } = _gH.findBuilding(garrison, payload.buildingId);
    const staticBuilding = await this._buildingRepo.findByCode(building.code) as IBuilding;

    _gH.checkBuildingAllowsHarvest(staticBuilding);

    const staticUnit = await this._unitRepo.findByCode(payload.code) as IUnit;
    const {
      unit
    } = _gH.findUnit(garrison, staticUnit.code);

    _gH.checkUnitAssignmentCoherence(
      now,
      payload.quantity || 1,
      unit,
      building
    );

    //////////////////////////////////////////////

    // 💰 update the resources
    if (staticUnit.code === 'peasant')
      garrison.resources = (await this._updateResources(garrison)).resources;

    switch (staticBuilding.code) {
      case 'goldmine': {
        if (!garrison.resources.goldLastUpdate)
          garrison.resources = {
            ...garrison.resources,
            goldLastUpdate: now
          };
        break;
      }
      case 'sawmill': {
        if (!garrison.resources.woodLastUpdate)
          garrison.resources = {
            ...garrison.resources,
            woodLastUpdate: now
          };
        break;
      }
    }

    //////////////////////////////////////////////

    // 👨‍💼 prepare to assign!
    for (let i = 0; i < (payload.quantity || 1); i++) {
      const {
        index: aIndex
      } = _gH.findAssignment(
        unit,
        building._id,
        'harvest',
        false
      );

      if (aIndex < 0) {
        unit
          .state
          .assignments
          .push({
            _id: new ObjectId(),
            buildingId: building._id,
            quantity: 1,
            type: 'harvest',
            endDate: new Date('2099-01-01')
          });
        continue;
      }
      unit
        .state
        .assignments[aIndex] = {
          ...unit.state.assignments[aIndex],
          quantity: unit
            .state
            .assignments[aIndex]
            .quantity + 1
        };
    }

    //////////////////////////////////////////////

    // 💾 save in database
    garrison.markModified('instances.units');
    await garrison.save();

    return await this.findById(garrison._id);
  }

  /**
   * Unassign a unit (peasant) from a (harvest) building.
   * @param payload @see IUnitUnassign
   */
  async unassignUnit(payload: IUnitUnassign) {
    // ❔ make the checks
    const garrison = await this.findById(payload.garrisonId);
    const {
      building
    } = _gH.findBuilding(garrison, payload.buildingId);
    const staticBuilding = await this._buildingRepo.findByCode(building.code) as IBuilding;

    _gH.checkBuildingAllowsHarvest(staticBuilding);

    const staticUnit = await this._unitRepo.findByCode(payload.code) as IUnit;
    const {
      unit
    } = _gH.findUnit(garrison, payload.code);

    const {
      index: aIndex
    } = _gH
      .findAssignment(
        unit,
        building._id,
        'harvest'
      );
    const assignment = unit.state.assignments[aIndex];

    if (assignment.quantity < (payload.quantity || 1))
      throw new ErrorHandler(
        412,
        `Given quantity (${payload.quantity}) cannot be greather than current assigned peasants (${assignment.quantity}).`
      );

    //////////////////////////////////////////////

    // 💰 update the resources (first checkpoint)
    if (staticUnit.code === 'peasant')
      garrison.resources = (await this._updateResources(garrison)).resources;

    //////////////////////////////////////////////

    // 👨‍💼 unassign units from the building
    assignment.quantity = assignment.quantity - (payload.quantity || 1);
    if (assignment.quantity === 0) unit.state.assignments.splice(aIndex, 1);

    //////////////////////////////////////////////

    // 💰 update the resources (second checkpoint)
    if (staticUnit.code === 'peasant')
      garrison.resources = (await this._updateResources(garrison)).resources;

    //////////////////////////////////////////////

    // 💾 save in database
    garrison.markModified('instances.units');
    garrison.markModified('resources');
    await garrison.save();

    return await this.findById(garrison._id);
  }

  /**
   * Dynamically update garrison resources.
   * @param garrison Given garrison.
   */
  private async _updateResources(garrison: IGarrisonDocument) {
    // ⌚ init the moment
    const now = new Date();

    //////////////////////////////////////////////

    // ❔ make the checks
    const {
      index: uIndex
    } = _gH
      .findUnit(
        garrison,
        'peasant',
        false
      );
    if (uIndex < 0) return garrison;
    const unit = garrison.instances.units[uIndex];

    //////////////////////////////////////////////

    // 💰 update resource for each harvest
    for (const building of garrison.instances.buildings) {
      const staticBuilding = await this._buildingRepo.findByCode(building.code) as IBuilding;

      const harvest = _gH.checkBuildingAllowsHarvest(staticBuilding);
      if (!harvest) continue;

      _gH.checkBuildingAvailability(now, building);

      const {
        index: aIndex
      } = _gH
        .findAssignment(
          unit,
          building._id,
          'harvest',
          false
        );
      if (aIndex < 0) {
        const activePeasants = _gH
          .checkHarvestingPeasants(
            unit,
            garrison.instances.buildings,
            staticBuilding.code
          );
        if (!activePeasants)
          delete garrison.resources[`${harvest.resource}LastUpdate` as 'goldLastUpdate' | 'woodLastUpdate'];

        continue;
      }
      const assignment = unit.state.assignments[aIndex];

      let elapsedMinutes = 0;
      switch (staticBuilding.code) {
        case 'goldmine': {
          if (!garrison.resources.goldLastUpdate) continue;

          elapsedMinutes = _h
            .computeElapsedMinutes(
              garrison.resources.goldLastUpdate,
              now
            );
          if (elapsedMinutes === 0) continue;

          garrison.resources.goldLastUpdate = now;
          break;
        }

        case 'sawmill': {
          if (!garrison.resources.woodLastUpdate) continue;

          elapsedMinutes = _h
            .computeElapsedMinutes(
              garrison.resources.woodLastUpdate,
              now
            );
          if (elapsedMinutes === 0) continue;

          garrison.resources.woodLastUpdate = now;
          break;
        }

        default: {
          continue;
        }
      }

      const owned = garrison.resources[harvest.resource];
      const earned = Math.floor(harvest.amount * elapsedMinutes) * assignment.quantity;

      garrison.resources = {
        ...garrison.resources,
        [harvest.resource]: owned + earned
      };
    }
    return garrison;
  }
}