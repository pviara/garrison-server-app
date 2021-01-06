import ErrorHandler from '../../../config/models/error/error-handler.model';

import LoggerService from '../../../config/services/logger/logger.service';
import { ELogType as logType } from '../../../config/models/log/log.model';

import { Connection } from 'mongoose';
import { ObjectId } from 'mongodb';

import { IBuilding } from '../../../config/models/data/static/building/building.types';
import IBuildingConstructionCancel from '../../../config/models/data/garrison/payloads/IBuildingConstructionCancel';
import IBuildingCreate from '../../../config/models/data/garrison/payloads/IBuildingCreate';
import IBuildingUpgradeOrExtend from '../../../config/models/data/garrison/payloads/IBuildingUpgradeOrExtend';

import { IGarrison, IGarrisonModel, IOperatedConstruction } from '../../../config/models/data/garrison/garrison.types';
import IGarrisonCreate from '../../../config/models/data/garrison/payloads/IGarrisonCreate';

import { IUnit } from '../../../config/models/data/static/unit/unit.types';
import IUnitAssign from '../../../config/models/data/garrison/payloads/IUnitAssign';
import IUnitCreate from '../../../config/models/data/garrison/payloads/IUnitCreate';
import IUnitUnassign from '../../../config/models/data/garrison/payloads/IUnitUnassign';

import { IZone } from '../../../config/models/data/static/zone/zone.types'

import BuildingRepository from '../../statics/building/building.repo';
import CharacterRepository from '../character/character.repo';
import UnitRepository from '../../statics/unit/unit.repo';
import UserRepository from '../user/user.repo';
import ZoneRepository from '../../statics/zone/zone.repo';

import helper from '../../../utils/helper.utils';

export default class GarrisonRepository {
  private _logger = new LoggerService(this.constructor.name);

  private _garrisonModel = <IGarrisonModel>{};

  constructor(
    private _connection: Connection,
    private _buildingRepo: BuildingRepository,
    private _characterRepo: CharacterRepository,
    private _unitRepo: UnitRepository,
    private _userRepo: UserRepository,
    private _zoneRepo: ZoneRepository
  ) {
    this._logger.log(logType.pending, 'Initializing garrison repo...');
    this._garrisonModel = <IGarrisonModel>this._connection?.model('garrison');
    this._logger.log(logType.pass, 'Initialized garrison repo');
  }

  async findById(id: ObjectId) {
    return await this._garrisonModel.findById(id);
  }

  async getFromUser(userId: ObjectId) {
    // retrieve user
    const user = await this._userRepo.findById(userId);
    if (!user) throw new ErrorHandler(404, `User '${userId}' couldn't be found.`);

    // retrieve character
    const character = await this._characterRepo.getFromUser(userId);
    if (!character) throw new ErrorHandler(404, `Character from userId '${userId}' couldn't be found.`);

    // retrieve garrison
    const garrison = await this.getFromCharacter(character._id);
    if (!garrison) throw new ErrorHandler(404, `Garrison from characterId '${character._id}' couldn't be found.`);

    return garrison;
  }

  async getFromCharacter(characterId: ObjectId) {
    return await this._garrisonModel.findOne({ characterId });
  }

  async create(payload: IGarrisonCreate) {
    const characterGarrison = await this.getFromCharacter(payload.characterId);
    const existing = characterGarrison?.name.toLowerCase() === payload.name.toLowerCase();
    if (existing) throw new ErrorHandler(409, 'Already existing garrison.');

    // check on character existence
    const character = await this._characterRepo.findById(payload.characterId);
    if (!character) throw new ErrorHandler(404, `Character '${payload.characterId}' couldn't be found.`);

    // check on zone existence
    const zone = await this._zoneRepo.findByCode(payload.zone);
    if (!zone) throw new ErrorHandler(404, `Zone '${payload.zone}' couldn't be found.`);

    // check if zone is compliant with character's faction
    if (!((<IZone>zone).side === character.side.faction))
      throw new ErrorHandler(400, 'Selected zone is not compliant with character\'s faction.');

    // create the garrison with default values
    return await this._garrisonModel.create({
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
        units: [
          {
            code: 'peasant',
            quantity: 3,
            state: {
              assignments: []
            }
          }
        ]
      }
    });
  }

  findBuilding(garrison: IGarrison, id: ObjectId) {
    return garrison.instances.buildings.find(b => b._id?.toHexString() === id.toHexString());
  }

  findResarch(garrison: IGarrison, code: string) {
    return garrison.instances.researches.find(r => r.code === code);
  }

  findUnit(garrison: IGarrison, code: string) {
    return garrison.instances.units.find(u => u.code === code);
  }

  async addBuilding(payload: IBuildingCreate) {
    // init the moment
    const now = new Date();
    
    // check on garrison existence
    const garrison = await this.findById(payload.garrisonId);
    if (!garrison) throw new ErrorHandler(404, `Garrison ${payload.garrisonId} couldn't be found.`);
    
    // check on building existence
    const building = await this._buildingRepo.findByCode(payload.code) as IBuilding;
    if (!building) throw new ErrorHandler(404, `Building '${payload.code}' couldn't be found.`);

    let { duration, minWorkforce } = building.instantiation;
    const peasants = this.findUnit(garrison, 'peasant');
    if (!peasants) throw new ErrorHandler(404, 'Not a single peasant could be found.');
    if (payload.workforce > peasants.quantity) throw new ErrorHandler(400, 'Given workforce cannot be greater than current peasant quantity.');
    
    // check on peasants availability
    const unavailablePeasants = peasants
      .state
      .assignments
      .filter(a => a.endDate.getTime() > now.getTime())
      .map(a => Number(a.quantity))
      .reduce((prev, next) => prev + next, 0);
    if ((payload.workforce > (peasants.quantity - unavailablePeasants))) throw new ErrorHandler(412, 'Not enough available peasants.');

    if (payload.workforce < minWorkforce) throw new ErrorHandler(400, 'Given workforce is not enough.');

    if (payload.workforce > minWorkforce * 2)
      throw new ErrorHandler(400, 'A build-site cannot rally more than the double of minimum required workforce.');

    // check on instantiation requirements
    const unfulfilled = building.instantiation.requiredEntities?.buildings.some(b => {
      // look for the building in garrison
      const existing = garrison.instances.buildings.find(gB => gB.code === b.code);
      if (!existing) return true;

      if (b.upgradeLevel) {
        // is the building at the required upgrade level ?
        const upgraded = existing.constructions.find(c => <number>c.improvement?.level >= <number>b.upgradeLevel);
        if (!upgraded) return true;

        // is the building still being processed for this specific upgrade ?
        if (upgraded.endDate.getTime() > now.getTime()) return true;
      }

      // is the building still being processed for its instantiation ?
      const unavailable = existing.constructions.some(c => !c.improvement && (c.endDate.getTime() > now.getTime()));
      if (unavailable) return true;
    });
    if (unfulfilled) throw new ErrorHandler(412, 'Garrison does not fulfill upgrade requirements.');
    
    // apply bonus: each additionnal worker reduces duration by 3%
    const newDuration = duration * Math.pow(0.97, payload.workforce - minWorkforce);
    duration = Math.floor(newDuration);

    // operate building construction
    const constructed: IOperatedConstruction = {
      _id: new ObjectId(),
      beginDate: now,
      endDate: helper.addTime(now, newDuration * 1000),
      workforce: payload.workforce
    };
    
    const buildingId = new ObjectId();
    garrison.instances.buildings = [
      ...garrison.instances.buildings,
      {
        _id: buildingId,
        code: payload.code,
        constructions: [constructed]
      }
    ];

    // automatically update eligible resources
    garrison.resources = (await this.updateResources(garrison)).resources;

    const goldCost = building.instantiation.cost.gold;
    const woodCost = building.instantiation.cost.wood;
    const plotCost = building.instantiation.cost.plot;
    if (garrison.resources.gold - goldCost < 0
    || garrison.resources.wood - woodCost < 0
    || garrison.resources.plot - plotCost < 0)
      throw new ErrorHandler(412, 'Not enough resources.');
    
    garrison.resources = {
      ...garrison.resources,
      gold: garrison.resources.gold - goldCost,
      wood: garrison.resources.wood - woodCost,
      plot: garrison.resources.plot - plotCost
    }

    if (building.harvest && !building.harvest.maxWorkforce)
      garrison.resources[building.harvest.resource] += building.harvest.amount;
    
    // assign rallied workforce to their occupation
    peasants.state.assignments = [
      ...peasants.state.assignments,
      {
        _id: new ObjectId(),
        buildingId,
        quantity: payload.workforce,
        type: 'construction',
        endDate: helper.addTime(now, newDuration * 1000)
      }
    ];

    // mark modified elements then save in database
    garrison.markModified('instances.buildings');
    garrison.markModified('instances.units');
    await garrison.save();
    
    return await this.findById(garrison._id);
  }

  async cancelBuildingConstruction(payload: IBuildingConstructionCancel) {
    // check on garrison existence
    const garrison = await this.findById(payload.garrisonId);
    if (!garrison) throw new ErrorHandler(404, `Garrison '${payload.garrisonId}' couldn\'t be found.`);

    const garrBuilding = this.findBuilding(garrison, payload.buildingId);
    if (!garrBuilding) throw new ErrorHandler(404, `Building '${payload.buildingId}' couldn't be found in garrison.`);
    
    // check on building existence
    const building = await this._buildingRepo.findByCode(garrBuilding.code) as IBuilding;
    if (!building) throw new ErrorHandler(404, 'Building couldn\'t be found.');

    // check on construction existence
    const index = garrBuilding
      .constructions
      .findIndex(c => c._id.toHexString() === payload.constructionId.toHexString());
    if (index < 0) throw new ErrorHandler(404, 'Construction couldn\'t be found.');

    // compute the resources to refund before deleting the concerned construction
    let gold = building.instantiation.cost.gold;
    let wood = building.instantiation.cost.wood;
    let plot = building.instantiation.cost.plot;
    
    // check whether the current construction process is an improvement
    const improvement = garrBuilding.constructions[index].improvement;
    if (improvement) {
      gold = gold * Math.pow(1.6, improvement.level);
      wood = wood * Math.pow(1.6, improvement.level);
      plot = Math.round((plot / 2) * Math.pow(1.3, improvement.level));

      // delete just the concerned construction
      garrBuilding.constructions.splice(index, 1);
    } else {
      // delete the whole building since no other construction can be found
      garrison.instances.buildings.splice(
        garrison.instances.buildings.findIndex(b => b._id?.toHexString() === garrBuilding._id?.toHexString()),
        1
      );
    }

    // refund the man please 💰
    garrison.resources = {
      ...garrison.resources,
      gold: garrison.resources.gold + gold,
      wood: garrison.resources.wood + wood,
      plot: garrison.resources.plot + plot
    };

    if (building.harvest) {
      if (building.code === 'goldmine') {
        // if the deleted building was the only remaining building of this type, delete last update date
        const stillExisting = garrison
          .instances
          .buildings
          .some(b => b.code === building.code);
        if (!stillExisting) delete garrison.resources.goldLastUpdate;
      } else if (building.code === 'sawmill') {
        // if the deleted building was the only remaining building of this type, delete last update date
        const stillExisting = garrison
          .instances
          .buildings
          .some(b => b.code === building.code);
        if (!stillExisting) delete garrison.resources.woodLastUpdate;
      }
    }

    // unassign concerned workers
    const peasants = this.findUnit(garrison, 'peasant');
    peasants?.state.assignments.splice(
      peasants.state.assignments.findIndex(a => {
        if (a.endDate.getTime() === garrBuilding.constructions[index].endDate.getTime())
          return a;
      }),
      1
    );

    // mark modified elements then save in database
    garrison.markModified('instances.buildings');
    garrison.markModified('instances.units');
    await garrison.save();

    return await this.findById(garrison._id);
  }

  async upgradeBuilding(payload: IBuildingUpgradeOrExtend) {
    // init the moment
    const now = new Date();
    
    // check on garrison existence
    const garrison = await this.findById(payload.garrisonId);
    if (!garrison) throw new ErrorHandler(404, `Garrison '${payload.garrisonId}' couldn\'t be found.`);

    const garrBuilding = this.findBuilding(garrison, payload.buildingId);
    if (!garrBuilding) throw new ErrorHandler(404, `Building '${payload.buildingId}' couldn't be found in garrison.`);
    
    // check on building existence
    const building = await this._buildingRepo.findByCode(garrBuilding.code) as IBuilding;
    if (!building) throw new ErrorHandler(404, 'Building couldn\'t be found.');

    // check on building upgrade existence
    if (!building.upgrades || building.upgrades.length === 0)
      throw new ErrorHandler(412, `Building '${building.code}' cannot be upgraded.`);

    // check on building availability
    const unavailableBuilding = garrBuilding
      .constructions
      .some(c => c.endDate.getTime() > now.getTime());
    if (unavailableBuilding) throw new ErrorHandler(412, `Building '${payload.buildingId}' is already being processed.`);

    // check on current building upgrade level
    const currentLevel = garrBuilding
      .constructions
      .filter(c => c.improvement?.type === 'upgrade')
      .map(c => <number>c.improvement?.level)
      .reduce((prev, next) => next > prev ? next : prev, 0);

    // check on upgrade possibility
    const nextUpgrade = building.upgrades.find(u => u.level >= currentLevel + 1);
    if (!nextUpgrade) throw new ErrorHandler(400, `No upgrade is available at this level (${currentLevel}).`);

    // check on upgrade requirements
    const unfulfilled = nextUpgrade.requiredEntities?.buildings.some(b => {
      // look for the building in garrison
      const existing = garrison.instances.buildings.find(gB => gB.code === b.code);
      if (!existing) return true;

      if (b.upgradeLevel) {
        // is the building at the required upgrade level ?
        const upgraded = existing.constructions.find(c => <number>c.improvement?.level >= <number>b.upgradeLevel);
        if (!upgraded) return true;

        // is the building still being processed for this specific upgrade ?
        if (upgraded.endDate.getTime() > now.getTime()) return true;
      }

      // is the building still being processed for its instantiation ?
      const unavailable = existing.constructions.some(c => !c.improvement && (c.endDate.getTime() > now.getTime()));
      if (unavailable) return true;
    });
    if (unfulfilled) throw new ErrorHandler(412, 'Garrison does not fulfill upgrade requirements.');
      
    // retrieve and increase both duration and minWorkforce according to current upgrade level
    let { duration, minWorkforce } = building.instantiation;
    duration = Math.round(duration * Math.pow(1.3, currentLevel + 1));
    minWorkforce = minWorkforce * Math.pow(2, currentLevel + 1);

    const peasants = this.findUnit(garrison, 'peasant');
    if (!peasants) throw new ErrorHandler(404, 'Not a single peasant could be found.');
    if (payload.workforce > peasants.quantity) throw new ErrorHandler(400, 'Given workforce cannot be greater than current peasant quantity.');

    // check on peasants availability
    const unavailablePeasants = peasants
      .state
      .assignments
      .filter(a => a.endDate.getTime() > now.getTime())
      .map(a => a.quantity)
      .reduce((prev, next) => prev + next, 0);
    if ((payload.workforce > (peasants.quantity - unavailablePeasants))) throw new ErrorHandler(412, 'Not enough available peasants.');

    if (payload.workforce < minWorkforce) throw new ErrorHandler(400, 'Given workforce is not enough.');

    if (payload.workforce > minWorkforce * 2)
      throw new ErrorHandler(400, 'A build-site cannot rally more than the double of minimum required workforce.');
    
    // apply bonus: each additionnal worker reduces duration by 3%
    const newDuration = duration * Math.pow(0.97, payload.workforce - minWorkforce);
    duration = Math.floor(newDuration);

    // operate building upgrade
    const constructed: IOperatedConstruction = {
      _id: new ObjectId(),
      beginDate: now,
      endDate: helper.addTime(now, newDuration * 1000),
      workforce: payload.workforce,
      improvement: {
        type: 'upgrade',
        level: currentLevel + 1
      }
    };

    garrison.instances.buildings = garrison
      .instances
      .buildings
      .map(b => {
        if (b.code === building.code) {
          b.constructions = [
            ...b.constructions,
            constructed
          ]
        }
        return b;
      });

    const goldCost = Math.round(building.instantiation.cost.gold * Math.pow(1.6, currentLevel + 1));
    const woodCost = Math.round(building.instantiation.cost.wood * Math.pow(1.6, currentLevel + 1));
    const plotCost =  Math.round((building.instantiation.cost.plot / 2) * Math.pow(1.3, currentLevel + 1));
    if (garrison.resources.gold - goldCost < 0
    || garrison.resources.wood - woodCost < 0
    || garrison.resources.plot - plotCost < 0)
      throw new ErrorHandler(412, 'Not enough resources.');
    
    garrison.resources = {
      ...garrison.resources,
      gold: garrison.resources.gold - goldCost,
      wood: garrison.resources.wood - woodCost,
      plot: garrison.resources.plot - plotCost
    }

    if (building.harvest && !building.harvest.maxWorkforce)
      garrison.resources[building.harvest.resource] += Math.round(
        building.harvest.amount * Math.pow(1.2, currentLevel + 1)
      );
    
    // assign rallied workforce to their occupation
    peasants.state.assignments = [
      ...peasants.state.assignments,
      {
        _id: new ObjectId(),
        buildingId: <ObjectId>garrBuilding._id,
        quantity: payload.workforce,
        type: 'construction',
        endDate: helper.addTime(now, newDuration * 1000)
      }
    ];

    // mark modified elements then save in database
    garrison.markModified('instances.buildings');
    garrison.markModified('instances.units');
    await garrison.save();
    
    return await this.findById(garrison._id);
  }

  async extendBuilding(payload: IBuildingUpgradeOrExtend) {
    // init the moment
    const now = new Date();
    
    // check on garrison existence
    const garrison = await this.findById(payload.garrisonId);
    if (!garrison) throw new ErrorHandler(404, `Garrison '${payload.garrisonId}' couldn\'t be found.`);

    const garrBuilding = this.findBuilding(garrison, payload.buildingId);
    if (!garrBuilding) throw new ErrorHandler(404, `Building '${payload.buildingId}' couldn't be found in garrison.`);
    
    // check on building existence
    const building = await this._buildingRepo.findByCode(garrBuilding.code) as IBuilding;
    if (!building) throw new ErrorHandler(404, 'Building couldn\'t be found.');

    // check on building extension existence
    if (!building.extension)
      throw new ErrorHandler(412, `Building '${building.code}' cannot be extended.`);

    // check on building availability
    const unavailableBuilding = garrBuilding
      .constructions
      .some(c => c.endDate.getTime() > now.getTime());
    if (unavailableBuilding) throw new ErrorHandler(412, `Building '${payload.buildingId}' is already being processed.`);

    // check on current building extension level
    const currentLevel = garrBuilding
      .constructions
      .filter(c => c.improvement?.type === 'extension')
      .map(c => <number>c.improvement?.level)
      .reduce((prev, next) => next > prev ? next : prev, 0);

    // check on upgrade possibility
    if ((currentLevel + 1) > <number>building.extension.maxLevel)
      throw new ErrorHandler(400, `No extension is available at this level (${currentLevel}).`);

    // check on upgrade requirements
    const unfulfilled = building.extension.requiredEntities?.buildings.some(b => {
      // look for the building in garrison
      const existing = garrison.instances.buildings.find(gB => gB.code === b.code);
      if (!existing) return true;

      if (b.upgradeLevel && (b.level === currentLevel + 1)) {
        // is the building at the required upgrade level ?
        const upgraded = existing.constructions.find(c => <number>c.improvement?.level >= <number>b.upgradeLevel);
        if (!upgraded) return true;

        // is the building still being processed for this specific upgrade ?
        if (upgraded.endDate.getTime() > now.getTime()) return true;
      }

      // is the building still being processed for its instantiation ?
      const unavailable = existing.constructions.some(c => !c.improvement && (c.endDate.getTime() > now.getTime()));
      if (unavailable) return true;
    });
    if (unfulfilled) throw new ErrorHandler(412, 'Garrison does not fulfill extension requirements.');

    // retrieve and increase both duration and minWorkforce according to current extension level
    let { duration, minWorkforce } = building.instantiation;
    duration = Math.round(duration * Math.pow(1.3, currentLevel + 1));
    minWorkforce = minWorkforce * Math.pow(2, currentLevel + 1);

    const peasants = this.findUnit(garrison, 'peasant');
    if (!peasants) throw new ErrorHandler(404, 'Not a single peasant could be found.');
    if (payload.workforce > peasants.quantity) throw new ErrorHandler(400, 'Given workforce cannot be greater than current peasant quantity.');
    
    // check on peasants availability
    const unavailablePeasants = peasants
      .state
      .assignments
      .filter(a => a.endDate.getTime() > now.getTime())
      .map(a => a.quantity)
      .reduce((prev, next) => prev + next, 0);
    if ((payload.workforce > (peasants.quantity - unavailablePeasants))) throw new ErrorHandler(412, 'Not enough available peasants.');

    if (payload.workforce < minWorkforce) throw new ErrorHandler(400, 'Given workforce is not enough.');

    if (payload.workforce > minWorkforce * 2)
      throw new ErrorHandler(400, 'A build-site cannot rally more than the double of minimum required workforce.');
    
    // apply bonus: each additionnal worker reduces duration by 3%
    const newDuration = duration * Math.pow(0.97, payload.workforce - minWorkforce);
    duration = Math.floor(newDuration);

    // operate building upgrade
    const constructed: IOperatedConstruction = {
      _id: new ObjectId(),
      beginDate: now,
      endDate: helper.addTime(now, newDuration * 1000),
      workforce: payload.workforce,
      improvement: {
        type: 'extension',
        level: currentLevel + 1
      }
    };

    garrison.instances.buildings = garrison
      .instances
      .buildings
      .map(b => {
        if (b.code === building.code) {
          b.constructions = [
            ...b.constructions,
            constructed
          ]
        }
        return b;
      });

    const goldCost = Math.round(building.instantiation.cost.gold * Math.pow(1.6, currentLevel + 1));
    const woodCost = Math.round(building.instantiation.cost.wood * Math.pow(1.6, currentLevel + 1));
    const plotCost =  Math.round((building.instantiation.cost.plot / 2) * Math.pow(1.5, currentLevel + 1));
    if (garrison.resources.gold - goldCost < 0
    || garrison.resources.wood - woodCost < 0
    || garrison.resources.plot - plotCost < 0)
      throw new ErrorHandler(412, 'Not enough resources.');
    
    garrison.resources = {
      ...garrison.resources,
      gold: garrison.resources.gold - goldCost,
      wood: garrison.resources.wood - woodCost,
      plot: garrison.resources.plot - plotCost
    }

    if (building.harvest && !building.harvest.maxWorkforce)
      garrison.resources[building.harvest.resource] += Math.round(
        building.harvest.amount * Math.pow(1.2, currentLevel + 1)
      );
    
    // assign rallied workforce to their occupation
    peasants.state.assignments = [
      ...peasants.state.assignments,
      {
        _id: new ObjectId(),
        buildingId: <ObjectId>garrBuilding._id,
        quantity: payload.workforce,
        type: 'construction',
        endDate: helper.addTime(now, newDuration * 1000)
      }
    ];

    // mark modified elements then save in database
    garrison.markModified('instances.buildings');
    garrison.markModified('instances.units');
    await garrison.save();
    
    return await this.findById(garrison._id);
  }

  async addUnit(payload: IUnitCreate) {
    // init the moment
    const now = new Date();
    
    // check on garrison existence
    const garrison = await this.findById(payload.garrisonId);
    if (!garrison) throw new ErrorHandler(404, `Garrison ${payload.garrisonId} couldn't be found.`);
    
    // check on unit existence
    const unit = await this._unitRepo.findByCode(payload.code) as IUnit;
    if (!unit) throw new ErrorHandler(404, `Unit '${payload.code}' couldn't be found.`);

    // check on instantiation requirements
    const unfulfilled = unit.instantiation.requiredEntities?.buildings.some(b => {
      // look for the building in garrison
      const existing = garrison.instances.buildings.find(gB => gB.code === b.code);
      if (!existing) return true;

      if (b.upgradeLevel) {
        // is the building at the required upgrade level ?
        const upgraded = existing.constructions.find(c => <number>c.improvement?.level >= <number>b.upgradeLevel);
        if (!upgraded) return true;

        // is the building still being processed for this specific upgrade ?
        if (upgraded.endDate.getTime() > now.getTime()) return true;
      }

      // is the building still being processed for its instantiation ?
      const unavailable = existing.constructions.some(c => !c.improvement && (c.endDate.getTime() > now.getTime()));
      if (unavailable) return true;
    });
    if (unfulfilled) throw new ErrorHandler(412, 'Garrison does not fulfill instantiation requirements.');

    // operate unit creation
    const assignments: IGarrison['instances']['units'][any]['state']['assignments'] = [];
    for (let i = 0; i < (payload.quantity || 1); i++) {
      assignments.push({
        quantity: 1,
        type: 'instantiation',
        endDate: helper.addTime(
          assignments[i - 1]?.endDate || now,
          unit.instantiation.duration * 1000
        )
      });
    }

    const newUnit = {
      code: unit.code,
      quantity: payload.quantity || 1,
      state: { assignments }
    };
    
    const index = garrison.instances.units.findIndex(u => u.code === newUnit.code);
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

    const goldCost = unit.instantiation.cost.gold * newUnit.quantity;
    const woodCost = unit.instantiation.cost.wood * newUnit.quantity;
    const foodCost = unit.instantiation.cost.food * newUnit.quantity;
    if (garrison.resources.gold - goldCost < 0
    || garrison.resources.wood - woodCost < 0
    || garrison.resources.food - foodCost < 0)
      throw new ErrorHandler(412, 'Not enough resources.');

    garrison.resources = {
      ...garrison.resources,
      gold: garrison.resources.gold - goldCost,
      wood: garrison.resources.wood - woodCost,
      food: garrison.resources.food - foodCost
    }

    // mark modified elements then save in database
    garrison.markModified('instances.units');
    await garrison.save();
    
    return await this.findById(garrison._id);
  }

  async assignUnit(payload: IUnitAssign) {
    // init the moment
    const now = new Date();
    
    // check on garrison existence
    const garrison = await this.findById(payload.garrisonId);
    if (!garrison) throw new ErrorHandler(404, `Garrison '${payload.garrisonId}' couldn\'t be found.`);

    // check on building existence in dynamic
    const garrBuilding = this.findBuilding(garrison, payload.buildingId);
    if (!garrBuilding) throw new ErrorHandler(404, `Building '${payload.buildingId}' couldn't be found in garrison.`);
    
    // check on building existence in statics
    const building = await this._buildingRepo.findByCode(garrBuilding.code) as IBuilding;
    if (!building) throw new ErrorHandler(404, `Building '${garrBuilding.code}' couldn't be found.`);

    // handle only harvest building for now...
    if (!building.harvest) throw new ErrorHandler(400, `No peasant can be assigned at building '${building.code}'.`);

    // check on unit(s) existence in statics
    const unit = await this._unitRepo.findByCode(payload.code) as IUnit;
    if (!unit) throw new ErrorHandler(404, `Unit ${payload.code} couldn't be found.`);

    // check on unit(s) existence in dynamic
    const garrUnits = this.findUnit(garrison, payload.code);
    if (!garrUnits) throw new ErrorHandler(404, `Not a single '${payload.code}' could be found.`);
    if ((payload.quantity || 1) > garrUnits.quantity) throw new ErrorHandler(412, `Given workforce cannot be greater than current '${payload.code}' quantity.`);

    // check on building availability
    const unavailableBuilding = garrBuilding
      .constructions
      .some(c => c.endDate.getTime() > now.getTime());
    if (unavailableBuilding) throw new ErrorHandler(412, `Building '${payload.buildingId}' is already being processed.`);

    // check on unit(s) availability
    const unavailableUnits = garrUnits
      .state
      .assignments
      .filter(a => a.endDate.getTime() > now.getTime())
      .map(a => Number(a.quantity))
      .reduce((prev, next) => prev + next, 0);
    if (((payload.quantity || 1) > (garrUnits.quantity - unavailableUnits))) throw new ErrorHandler(412, `Not enough available '${payload.code}'.`);

    // update garrison resources if assigning one or more peasants
    if (unit.code === 'peasant') {
      garrison.resources = (await this.updateResources(garrison)).resources;
    }

    // assign units to the building
    for (let i = 0; i < (payload.quantity || 1); i++) {
      const index = garrUnits.state.assignments.findIndex(a => (a.buildingId?.toHexString() === garrBuilding._id?.toHexString()) && a.type === 'harvest');
      if (index < 0) {
        garrUnits.state.assignments.push({
          buildingId: garrBuilding._id,
          quantity: 1,
          type: 'harvest',
          endDate: new Date('2099-01-01')
        });
        continue;
      }
      garrUnits.state.assignments[index] = {
        ...garrUnits.state.assignments[index],
        quantity: garrUnits.state.assignments[index].quantity + 1
      };
    }

    // init resource last update if there isn't any
    if (building.harvest) {
      if (building.code === 'goldmine' && !garrison.resources.goldLastUpdate) {
        garrison.resources = {
          ...garrison.resources,
          goldLastUpdate: now
        };
      } else if (building.code === 'sawmill' && !garrison.resources.woodLastUpdate) {
        garrison.resources = {
          ...garrison.resources,
          woodLastUpdate: now
        };
      }
    }

    // mark modified elements then save in database
    garrison.markModified('instances.units');
    await garrison.save();
    
    return await this.findById(garrison._id);
  }

  async unassignUnit(payload: IUnitUnassign) {
    // init the moment
    const now = new Date();
    
    // check on garrison existence
    const garrison = await this.findById(payload.garrisonId);
    if (!garrison) throw new ErrorHandler(404, `Garrison '${payload.garrisonId}' couldn\'t be found.`);

    // check on building existence in dynamic
    const garrBuilding = this.findBuilding(garrison, payload.buildingId);
    if (!garrBuilding) throw new ErrorHandler(404, `Building '${payload.buildingId}' couldn't be found in garrison.`);
    
    // check on building existence in statics
    const building = await this._buildingRepo.findByCode(garrBuilding.code) as IBuilding;
    if (!building) throw new ErrorHandler(404, `Building '${garrBuilding.code}' couldn't be found.`);

    // handle only harvest building for now...
    if (!building.harvest) throw new ErrorHandler(400, `No peasant can be assigned at building '${building.code}'.`);

    // check on unit(s) existence in statics
    const unit = await this._unitRepo.findByCode(payload.code) as IUnit;
    if (!unit) throw new ErrorHandler(404, `Unit ${payload.code} couldn't be found.`);

    // check on unit(s) existence in dynamic
    const garrUnits = this.findUnit(garrison, payload.code);
    if (!garrUnits) throw new ErrorHandler(404, `Not a single '${payload.code}' could be found.`);
    
    // check on assignment existence
    const index = garrUnits
      .state
      .assignments
      .findIndex(a => {
        if (garrBuilding._id && a.buildingId) {
          const areSame = helper.areSameObjectId(garrBuilding._id, a.buildingId);
          if (areSame && a.type === 'harvest') return a;
        }
      });
    if (index < 0) throw new ErrorHandler(404, 'No assignment could be found.');
    if (garrUnits.state.assignments[index].quantity < (payload.quantity || 1))
      throw new ErrorHandler(412, 'Given quantity cannot be greather than current assigned peasants.');

    // update garrison resources if unassigning one or more peasants
    if (unit.code === 'peasant') {
      garrison.resources = (await this.updateResources(garrison)).resources;
    }

    // unassigning units from the building
    garrUnits.state.assignments[index].quantity = garrUnits.state.assignments[index].quantity - (payload.quantity || 1);
    if (garrUnits.state.assignments[index].quantity === 0) garrUnits.state.assignments.splice(index, 1);

    // update resource last update
    if (building.harvest) {
      if (building.code === 'goldmine') {
        // check if at least 1 worker is assigned to some harvest building
        const noActiveworker = !garrUnits.state.assignments.some(a => {
          return a.type === 'harvest' && garrison
            .instances
            .buildings
            .find(b => b?._id?.equals(a.buildingId || "") && b.code === building.code);
        });
        if (noActiveworker) delete garrison.resources.goldLastUpdate;
      } else if (building.code === 'sawmill') {
        // check if at least 1 worker is assigned to some harvest building
        const noActiveworker = !garrUnits.state.assignments.some(a => {
          return a.type === 'harvest' && garrison
            .instances
            .buildings
            .find(b => b?._id?.equals(a.buildingId || "") && b.code === building.code);
        });
        if (noActiveworker) delete garrison.resources.woodLastUpdate;
      }
    }

    // mark modified elements then save in database
    garrison.markModified('instances.units');
    await garrison.save();
    
    return await this.findById(garrison._id);
  }

  private async updateResources(garrison: IGarrison) {
    // init the moment
    const now = new Date();

    for (const building of garrison.instances.buildings) {
      // retrieve matching building from database statics
      const matchStatics = await this._buildingRepo.findByCode(building.code) as IBuilding;
      if (!matchStatics.harvest) continue;

      // check on building availability
      const unavailable = building
        .constructions
        .some(c => c.endDate.getTime() > now.getTime());
      if (unavailable) continue;

      // calculate assigned workers
      const assignedWorkers = garrison
        .instances
        .units
        .find(unit => unit.code === 'peasant')
        ?.state
        .assignments
        .find(assignment => {
          if (assignment.type !== 'harvest' || !assignment.buildingId || !building._id) return;

          const buildingId = new ObjectId(assignment.buildingId);
          if (buildingId.equals(building._id)) return assignment;
        })
        ?.quantity;
      if (!assignedWorkers || assignedWorkers == 0) continue;

      // calculate elapsed time since last resource automatic update
      let elapsedMinutes = 0;
      let goldNewLastUpdate;
      let woodNewLastUpdate;
      if (building.code === 'goldmine') {
        if (!garrison.resources.goldLastUpdate) continue;
        elapsedMinutes = (now.getTime() - garrison.resources.goldLastUpdate.getTime()) / 1000 / 60;
        goldNewLastUpdate = now;
      } else if (building.code === 'sawmill') {
        if (!garrison.resources.woodLastUpdate) continue;
        elapsedMinutes = (now.getTime() - garrison.resources.woodLastUpdate.getTime()) / 1000 / 60;
        woodNewLastUpdate = now;
      }
      if (elapsedMinutes === 0) continue;
        
      garrison.resources = {
        ...garrison.resources,
        [matchStatics.harvest?.resource]: garrison.resources[matchStatics.harvest?.resource] + Math.floor((matchStatics.harvest.amount * elapsedMinutes) * assignedWorkers),
        goldLastUpdate: goldNewLastUpdate || garrison.resources.goldLastUpdate,
        woodLastUpdate: woodNewLastUpdate || garrison.resources.woodLastUpdate
      };
    }
    return garrison;
  }
}