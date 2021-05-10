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
  IGarrison,
  IGarrisonBuilding,
  IGarrisonDocument,
  IGarrisonModel,
  IOperatedConstruction,
  IOperatedProject,
  IUnitAssignment
} from '../../../config/models/data/dynamic/garrison/garrison.types';
import IGarrisonCreate from '../../../config/models/data/dynamic/garrison/payloads/IGarrisonCreate';

import {
  IResearch
} from '../../../config/models/data/static/research/research.types';
import IResearchCancel from '../../../config/models/data/dynamic/garrison/payloads/IResearchCancel';
import IResearchCreate from '../../../config/models/data/dynamic/garrison/payloads/IResearchCreate';

import {
  IUnit
} from '../../../config/models/data/static/unit/unit.types';
import IUnitAssign from '../../../config/models/data/dynamic/garrison/payloads/IUnitAssign';
import IUnitCreate from '../../../config/models/data/dynamic/garrison/payloads/IUnitCreate';
import IUnitTrainingCancel from '../../../config/models/data/dynamic/garrison/payloads/IUnitTrainingCancel';

import {
  IZone
} from '../../../config/models/data/static/zone/zone.types'

import BuildingRepository from '../../static/building.repo';
import CharacterRepository from '../character/character.repo';
import ResearchRepository from '../../static/research.repo';
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
    private _researchRepo: ResearchRepository,
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
  async findById(id: ObjectId, strict?: true): Promise<IGarrisonDocument>;
  async findById(id: ObjectId, strict: false): Promise<IGarrisonDocument | null>;
  async findById(id: ObjectId, strict?: boolean) {
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
  async getFromUser(userId: ObjectId, strict?: true): Promise<IGarrisonDocument>;
  async getFromUser(userId: ObjectId, strict: false): Promise<IGarrisonDocument | null>;
  async getFromUser(userId: ObjectId, strict?: boolean) {
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
  async getFromCharacter(characterId: ObjectId, strict?: true): Promise<IGarrisonDocument>;
  async getFromCharacter(characterId: ObjectId, strict: false): Promise<IGarrisonDocument | null>;
  async getFromCharacter(characterId: ObjectId, strict?: boolean) {
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

    const staticBuildings = await this._buildingRepo.getAll();
    const staticBuilding = staticBuildings.find(building => building.code === payload.code) as IBuilding;

    _gH.checkConstructionLimit(
      now,
      staticBuilding,
      garrison.instances.buildings
    );

    const {
      unit: peasants
    } = _gH.findUnit(garrison, 'peasant');
    _gH.checkBuildingWorkforceCoherence(
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

    // 💰 update the resources
    garrison.resources = (await this._updateResources(garrison)).resources;
    garrison.resources = _gH
      .checkConstructionPaymentCapacity(
        now,
        garrison.instances.buildings,
        staticBuildings,
        garrison.resources,
        staticBuilding.instantiation.cost
      );

    // 💰 "gift-harvest" type of buildings directly give their resource here,
    if (staticBuilding.harvest && !staticBuilding.harvest.maxWorkforce)
      garrison.resources[staticBuilding.harvest.resource] += staticBuilding.harvest.amount;

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
      wood
    } = staticBuilding.instantiation.cost;

    const {
      improvement
    } = building.constructions[cIndex];
    if (improvement) {
      gold = Math.floor(gold * Math.pow(1.6, improvement.level));
      wood = Math.floor(wood * Math.pow(1.6, improvement.level));

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
      wood: garrison.resources.wood + wood
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
        case 'number': {
          if (!checkBuildingStillExists(garrison.instances.buildings, code))
            delete garrison.resources[`${harvest.resource}LastUpdate` as 'goldLastUpdate' | 'woodLastUpdate'];
          break;
        }

        case 'undefined': {
          const factor = improvement?.level
            ? Math.pow(_gH.getFactor('decreased'), improvement.level)
            : 1;

          const owed = Math.floor(harvest.amount * factor);
          const rest = garrison.resources[harvest.resource] - owed;

          garrison.resources[harvest.resource] = rest >= 0 ? rest : 0;
          break;
        }
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

  async cancelUnitTraining(payload: IUnitTrainingCancel) {
    // ❔ make the checks
    const garrison = await this.findById(payload.garrisonId);
    const {
      unit
    } = _gH.findUnit(garrison, payload.code);
    const staticUnit = await this._unitRepo.findByCode(unit.code);

    const {
      index
    } = _gH.findUnitAssignment(unit, payload.instantiationId);

    //////////////////////////////////////////////

    // 💰 prepare to refund!
    let {
      gold,
      wood
    } = staticUnit.instantiation.cost;

    garrison.resources = {
      ...garrison.resources,
      gold: garrison.resources.gold + gold,
      wood: garrison.resources.wood + wood
    };

    //////////////////////////////////////////////

    // 👨‍💼 unassign peasant from its own instantiation
    unit
      .state
      .assignments
      .splice(index, 1);

    unit.quantity -= 1;

    //////////////////////////////////////////////

    // 💾 save in database
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

    const staticBuildings = await this._buildingRepo.getAll();
    const staticBuilding = staticBuildings.find(sB => sB.code === building.code) as IBuilding;

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
    _gH.checkBuildingWorkforceCoherence(
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
        garrison.instances.buildings,
        staticBuildings,
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
        buildingId: <ObjectId>building._id,
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

    const staticBuildings = await this._buildingRepo.getAll();
    const staticBuilding = staticBuildings.find(sB => sB.code === building.code) as IBuilding;

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
    _gH.checkBuildingWorkforceCoherence(
      now,
      payload.workforce,
      peasants,
      staticBuilding,
      'upgrade',
      building.constructions
    );

    //////////////////////////////////////////////

    // 💰 update the resources
    garrison.resources = (await this._updateResources(garrison)).resources;
    garrison.resources = _gH
      .checkConstructionPaymentCapacity(
        now,
        garrison.instances.buildings,
        staticBuildings,
        garrison.resources,
        staticBuilding.instantiation.cost,
        'upgrade',
        building.constructions
      );

    // 💰 "gift-harvest" type of buildings directly give their resource here,
    if (staticBuilding.harvest && !staticBuilding.harvest.maxWorkforce)
      garrison.resources[staticBuilding.harvest.resource] += Math.floor(
        staticBuilding.harvest.amount * Math.pow(1.2, nextExtension)
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

    // 👨‍💼 assign peasants to building-site
    peasants.state.assignments = [
      ...peasants.state.assignments,
      {
        _id: new ObjectId(),
        buildingId: <ObjectId>building._id,
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

    const staticUnits = await this._unitRepo.getAll();
    const staticUnit = staticUnits.find(unit => unit.code === payload.code) as IUnit;

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

    _gH.checkTrainingLimit(
      now,
      staticUnit.code,
      payload.quantity || 1,
      garrison.instances.units,
      staticUnits,
      garrison.instances.buildings,
      await this._buildingRepo.getAll()
    );

    //////////////////////////////////////////////

    // 💰 update the resources
    const farm = await this._buildingRepo.findByCode('farm') as Required<IBuilding>;
    garrison.resources = (await this._updateResources(garrison)).resources;
    garrison.resources = _gH
      .checkTrainingPaymentCapacity(
        now,
        garrison.resources,
        garrison.instances.buildings,
        garrison.instances.units,
        staticUnit.instantiation.cost,
        payload.quantity || 1,
        farm.harvest.amount,
        staticUnits
      );

    //////////////////////////////////////////////

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
    const {
      index
    } = unit;

    if (index < 0) {
      garrison.instances.units = [
        ...garrison.instances.units,
        newUnit
      ];
    } else {
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

    // 💾 save in database
    garrison.markModified('instances.units');
    await garrison.save();

    return await this.findById(garrison._id);
  }

  /**
   * Randomly assign a unit (peasant) at a (harvest) building.
   * @param payload @see IUnitAssign
   */
  async assignUnitRandomly(payload: IUnitAssign) {
    // ⌚ init the moment
    const now = new Date();

    //////////////////////////////////////////////

    // ❔ make the checks
    const garrison = await this.findById(payload.garrisonId);
    const harvestBuildings = garrison
      .instances
      .buildings
      .filter(building => {
        const available = _gH
          .checkBuildingAvailability(
            now,
            building,
            false
          );

        if (building.code === payload.harvestCode && available)
          return building;
      });
    if (harvestBuildings.length === 0)
      throw new ErrorHandler(404, `Couldn't find any available '${payload.harvestCode}'.`);

    const { unit } = _gH.findUnit(garrison, 'peasant');

    const staticBuilding = await this._buildingRepo.findByCode(payload.harvestCode);
    const harvest = _gH.checkBuildingAllowsHarvest(staticBuilding);
    if (!harvest.maxWorkforce)
      throw new ErrorHandler(
        500,
        `Missing property 'maxWorkforce' in harvest building of type '${payload.harvestCode}'.`
      );

    //////////////////////////////////////////////

    // 👨‍💼 prepare to assign!
    let assigned = 0;
    for (const harvestBuilding of harvestBuildings) {
      if (assigned === payload.quantity) break;

      // ❔ make the checks
      _gH.checkUnitAssignmentCoherence(
        now,
        (payload.quantity - assigned),
        unit,
        harvestBuilding
      );

      //////////////////////////////////////////////

      // 💰 update the resources
      garrison.resources = (await this._updateResources(garrison)).resources;

      switch (harvestBuilding.code) {
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

      // 👨‍💼 make assignments!
      const currentLevel = _gH
        .computeBuildingCurrentLevel(
          now,
          'extension',
          harvestBuilding.constructions
        );
      const maxWorkforce = Math.floor(
        harvest.maxWorkforce * Math.pow(1.3, currentLevel)
      );

      while (assigned < payload.quantity) {
        const { index: aIndex } = _gH
          .findBuildingAssignment(
            unit,
            harvestBuilding._id,
            'harvest',
            false
          );
        if (
          unit
            .state
            .assignments[aIndex]
            ?.quantity === maxWorkforce
        ) break;

        const assignment: IUnitAssignment = {
          _id: new ObjectId(),
          buildingId: harvestBuilding._id,
          endDate: new Date('2099-01-01'),
          type: 'harvest',
          quantity: 1
        };

        if (aIndex < 0) {
          unit
            .state
            .assignments
            .push(assignment);
        } else {
          unit
            .state
            .assignments[aIndex] = {
            ...unit.state.assignments[aIndex],
            quantity: unit
              .state
              .assignments[aIndex]
              .quantity + 1
          }
        }
        assigned++;
      }
    }
    if (assigned < payload.quantity)
      throw new ErrorHandler(
        412,
        `Couldn't assign as much peasants as requested (only ${assigned} out of ${payload.quantity}).`
      );

    //////////////////////////////////////////////

    // 💾 save in database
    garrison.markModified('instances.units');
    await garrison.save();

    return await this.findById(garrison._id);
  }

  /**
   * Randomly unassign a unit (peasant) from a (harvest) building.
   * @param payload @see IUnitUnassign
   */
  async unassignUnitRandomly(payload: IUnitAssign) {
    // ❔ make the checks
    const garrison = await this.findById(payload.garrisonId);
    const harvestBuildings = garrison
      .instances
      .buildings
      .filter(building => building.code === payload.harvestCode);
    if (harvestBuildings.length === 0)
      throw new ErrorHandler(404, `Couldn't find any available '${payload.harvestCode}'.`);

    const { unit } = _gH.findUnit(garrison, 'peasant');

    const staticBuilding = await this._buildingRepo.findByCode(payload.harvestCode);
    const harvest = _gH.checkBuildingAllowsHarvest(staticBuilding);
    if (!harvest.maxWorkforce)
      throw new ErrorHandler(
        500,
        `Missing property 'maxWorkforce' in harvest building of type '${payload.harvestCode}'.`
      );

    //////////////////////////////////////////////

    // 💰 update the resources (first checkpoint)
    garrison.resources = (await this._updateResources(garrison)).resources;

    //////////////////////////////////////////////

    // 👨‍💼 prepare the unassignment!
    let unassigned = 0;
    for (const harvestBuilding of harvestBuildings) {
      while (unassigned < payload.quantity) {
        const {
          index: aIndex
        } = _gH
          .findBuildingAssignment(
            unit,
            harvestBuilding._id,
            'harvest',
            false
          );
        if (aIndex < 0) break;

        const assignment = {
          ...unit.state.assignments[aIndex],
          quantity: unit
            .state
            .assignments[aIndex]
            .quantity - 1
        };
        unit.state.assignments[aIndex] = assignment;
        unassigned++;

        if (assignment.quantity === 0) {
          unit.state.assignments.splice(aIndex, 1);
          break;
        };
      }
    }
    if (unassigned < payload.quantity)
      throw new ErrorHandler(
        412,
        `Couldn't unassign as much peasants as requested (only ${unassigned} out of ${payload.quantity}).`
      );

    //////////////////////////////////////////////

    // 💰 update the resources (second checkpoint)
    garrison.resources = (await this._updateResources(garrison)).resources;

    //////////////////////////////////////////////

    // 💾 save in database
    garrison.markModified('instances.units');
    garrison.markModified('resources');
    await garrison.save();

    return await this.findById(garrison._id);
  }

  /**
   * Add and save a new research.
   * @param payload @see IResearchCreate
   */
  async launchResearch(payload: IResearchCreate) {
    // ⌚ init the moment
    const now = new Date();

    //////////////////////////////////////////////

    // ❔ make the checks
    const garrison = await this.findById(payload.garrisonId);
    const staticResearch = await this._researchRepo.findByCode(payload.code) as IResearch;

    const {
      unit: researchers
    } = _gH.findUnit(garrison, 'researcher');

    _gH.checkResearchWorkforceCoherence(
      now,
      payload.workforce,
      researchers,
      staticResearch
    );

    const {
      requiredEntities
    } = staticResearch.instantiation;
    if (requiredEntities) {
      _gH.checkStandardRequirements(
        now,
        requiredEntities.buildings,
        garrison.instances.buildings
      );
    }

    //////////////////////////////////////////////

    // 💰 update the resources
    garrison.resources = (await this._updateResources(garrison)).resources;
    garrison.resources = _gH
      .checkResearchPaymentCapacity(
        now,
        garrison.resources,
        staticResearch.instantiation.cost
      );

    //////////////////////////////////////////////

    // 🔨 prepare to launch!
    const {
      duration
    } = _gH
      .computeResearchDurationAndWorkforce(
        payload.workforce,
        staticResearch
      );

    const project: IOperatedProject = {
      _id: new ObjectId(),
      beginDate: now,
      endDate: _h.addTime(now, duration * 1000),
      workforce: payload.workforce,
      level: 1
    };

    const researchId = new ObjectId();
    garrison.instances.researches = [
      ...garrison.instances.researches,
      {
        _id: researchId,
        code: payload.code,
        projects: [project]
      }
    ];

    //////////////////////////////////////////////

    // 👨‍💼 assign researchers to building-site
    researchers.state.assignments = [
      ...researchers.state.assignments,
      {
        _id: new ObjectId(),
        researchId,
        quantity: payload.workforce,
        type: 'research',
        endDate: _h.addTime(now, duration * 1000)
      }
    ];

    //////////////////////////////////////////////

    // 💾 save in database
    garrison.markModified('instances.researches');
    garrison.markModified('instances.units');
    await garrison.save();

    return await this.findById(garrison._id);
  }

  /**
   * Cancel an ongoing research project.
   * @param payload @see IResearchCancel
   * @returns 
   */
  async cancelResearch(payload: IResearchCancel) {
    // ❔ make the checks
    const garrison = await this.findById(payload.garrisonId);
    const {
      research,
      index: rIndex
    } = _gH.findResearch(garrison, payload.researchId);
    const staticResearch = await this._researchRepo.findByCode(research.code) as IResearch;

    const {
      index: pIndex
    } = _gH
      .findResearchProject(
        research,
        payload.projectId
      );

    //////////////////////////////////////////////

    // 💰 prepare to refund!
    let {
      gold,
      wood
    } = staticResearch.instantiation.cost;

    const {
      level
    } = research.projects[pIndex];
    if (level) {
      gold = Math.floor(gold * Math.pow(1.6, level));
      wood = Math.floor(wood * Math.pow(1.6, level));

      research
        .projects
        .splice(pIndex, 1);
    }

    garrison.resources = {
      ...garrison.resources,
      gold: garrison.resources.gold + gold,
      wood: garrison.resources.wood + wood
    };

    if (research.projects.length === 0) {
      garrison
        .instances
        .researches
        .splice(rIndex, 1);
    }

    //////////////////////////////////////////////

    // 👨‍💼 unassign researchers from building-site
    const {
      unit: researchers
    } = _gH.findUnit(garrison, 'researcher');
    const aIndex = researchers
      .state
      .assignments
      .findIndex(a => a.endDate.getTime() === research.projects[pIndex]?.endDate.getTime());

    researchers
      .state
      .assignments
      .splice(aIndex, 1);

    //////////////////////////////////////////////

    // 💾 save in database
    garrison.markModified('instances.researches');
    garrison.markModified('instances.units');
    await garrison.save();

    return await this.findById(garrison._id);
  }

  /**
   * Dynamically update garrison resources.
   * @param garrison Given garrison.
   */
  private async _updateResources(garrison: IGarrison) {
    // ⌚ init the moment
    const now = new Date();

    //////////////////////////////////////////////

    // ❔ make the checks
    const {
      index: uIndex
    } = _gH
      .findUnit(
        garrison as IGarrisonDocument,
        'peasant',
        false
      );
    if (uIndex < 0) return garrison;
    const unit = garrison.instances.units[uIndex];

    //////////////////////////////////////////////

    // 🛑 get the profit limits
    const goldLimit = _gH
      .computeGlobalProfitLimit(
        now,
        'goldmine',
        garrison.instances.buildings
      );
    const woodLimit = _gH
      .computeGlobalProfitLimit(
        now,
        'sawmill',
        garrison.instances.buildings
      );

    //////////////////////////////////////////////

    // 💰 update resource for each harvest
    for (const building of garrison.instances.buildings) {
      const staticBuilding = await this._buildingRepo.findByCode(building.code) as IBuilding;

      const harvest = _gH.checkBuildingAllowsHarvest(staticBuilding, false);
      if (!harvest || !harvest.maxWorkforce) continue;

      const available = _gH.checkBuildingAvailability(now, building, false);
      if (!available) continue;

      const {
        index: aIndex
      } = _gH
        .findBuildingAssignment(
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

      // compute total current resource 
      const owned = garrison.resources[harvest.resource];
      const earned = Math.floor(harvest.amount * elapsedMinutes) * assignment.quantity;
      let total = owned + earned;

      // make sure total isn't greater than limit
      switch (staticBuilding.code) {
        case 'goldmine': {
          if (total > goldLimit) total = goldLimit;
          break;
        }

        case 'sawmill': {
          if (total > woodLimit) total = woodLimit;
          break;
        }

        default: {
          continue;
        }
      }

      garrison.resources = {
        ...garrison.resources,
        [harvest.resource]: total
      };
    }
    return garrison;
  }
}