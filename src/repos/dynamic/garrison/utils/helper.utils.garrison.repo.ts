import ErrorHandler from '../../../../config/models/error/error-handler.model';

import {
  ObjectId
} from 'mongodb';

import {
  IBuildingImprovementType,
  IGarrisonBuilding,
  IGarrisonDocument,
  IGarrisonResources,
  IGarrisonUnit,
  IOperatedConstruction,
  IUnitAssignment
} from '../../../../config/models/data/dynamic/garrison/garrison.types';

import {
  IBuilding,
  IBuildingCost,
  IRequiredBuilding,
  IRequiredBuildingForExtensionLevel
} from '../../../../config/models/data/static/building/building.types';

import _h from '../../../../utils/helper.utils';
import { IUnit, IUnitCost } from '../../../../config/models/data/static/unit/unit.types';

/**
 * Garrison helper class. Contains static methods garrison repository only can use.
 */
class Helper {
  ///////////////////////////////////////
  // 👨‍💻 LOW-LEVEL
  ///////////////////////////////////////

  static getFactor(type: 'default' | 'decreased') {
    switch (type) {
      case 'default':
        if (!process.env.DEFAULT_FACTOR) throw new ErrorHandler(500, 'Couldn\'t retrieve DEFAULT_FACTOR from .env file.');
        return +process.env.DEFAULT_FACTOR;

      case 'decreased':
        if (!process.env.DECREASED_FACTOR) throw new ErrorHandler(500, 'Couldn\'t retrieve DECREASED_FACTOR from .env file.');
        return +process.env.DECREASED_FACTOR;
    }
  }
  
  ///////////////////////////////////////
  // 🔍 SEARCHES
  ///////////////////////////////////////

  /**
   * Find a specific assignment by both its type and buildingId inside a garrison unit.
   * @param unit Given garrison unit.
   * @param buildingId Given assignement building id.
   * @param type Given assignment type.
   */
  static findAssignment(
    unit: IGarrisonUnit,
    buildingId: ObjectId,
    type: IUnitAssignment['type'],
    strict?: true
  ): { assignment: IUnitAssignment; index: number }
  static findAssignment(
    unit: IGarrisonUnit,
    buildingId: ObjectId,
    type: IUnitAssignment['type'],
    strict: false
  ): { assignment: IUnitAssignment; index: number } | { index: -1 }
  static findAssignment(
    unit: IGarrisonUnit,
    buildingId: ObjectId,
    type: IUnitAssignment['type'],
    strict?: boolean
  ) {
    const { assignments } = unit.state;
    const returnedObj = {} as { assignment: IUnitAssignment; index: number };

    for (let index = 0; index < assignments.length; index++) {
      const assignment = assignments[index];
      if (
        assignment.type !== type
        || !assignment.buildingId?.equals(buildingId)
      ) continue;

      returnedObj.assignment = assignment;
      returnedObj.index = index;
      break;
    }
    
    if (_h.isObjectEmpty(returnedObj) && strict)
      throw new ErrorHandler(404, `Assignment of type '${type}' couldn't be found in building '${buildingId}'.`);

    return _h.isObjectEmpty(returnedObj) ? { index: -1 } : returnedObj;
  }
  
  /**
   * Find a specific building by its id inside a garrison.
   * @param garrison Given garrison document.
   * @param id Given ObjectId.
   * @param strict Sets whether an error is thrown when no building is found.
   * @returns Either an IGarrisonBuilding or (maybe) null if strict mode is set to false.
   */
  static findBuilding(garrison: IGarrisonDocument, id: ObjectId, strict?: true): { building: IGarrisonBuilding; index: number };
  static findBuilding(garrison: IGarrisonDocument, id: ObjectId, strict: false): { building: IGarrisonBuilding; index: number } | { index: -1 };
  static findBuilding(garrison: IGarrisonDocument, id: ObjectId, strict?: boolean) {
    const { buildings } = garrison.instances;
    const returnedObj = {} as { building: IGarrisonBuilding; index: number };

    for (let index = 0; index < buildings.length; index++) {
      if (!buildings[index]._id?.equals(id)) continue;
      returnedObj.building = buildings[index];
      returnedObj.index = index;
      break;
    }
    
    if (_h.isObjectEmpty(returnedObj) && strict)
      throw new ErrorHandler(404, `Building with buildingId '${id}' couldn't be found in garrison '${garrison._id}'.`);

    return _h.isObjectEmpty(returnedObj) ? { index: -1 } : returnedObj;
  }

  /**
   * Find a specific unit by its id inside a garrison.
   * @param garrison Given garrison document.
   * @param id Given ObjectId.
   * @param strict Sets whether an error is thrown when no unit is found.
   * @returns Either an IGarrisonUnit or (maybe) null if strict mode is set to false.
   */
  static findUnit(garrison: IGarrisonDocument, code: string, strict?: true): { unit: IGarrisonUnit; index: number };
  static findUnit(garrison: IGarrisonDocument, code: string, strict: false): { unit: IGarrisonUnit; index: number } | { index: - 1 };
  static findUnit(garrison: IGarrisonDocument, code: string, strict?: boolean) {
    const { units } = garrison.instances;
    const returnedObj = {} as { unit: IGarrisonUnit; index: number };

    for (let index = 0; index < units.length; index++) {
      if (!(units[index].code === code)) continue;
      returnedObj.unit = units[index];
      returnedObj.index = index;
      break;
    }
    
    if (_h.isObjectEmpty(returnedObj) && strict)
      throw new ErrorHandler(404, `Unit with code '${code}' couldn't be found in garrison '${garrison._id}'.`);

    return _h.isObjectEmpty(returnedObj) ? { index: -1 } : returnedObj;
  }

  /**
   * Find a specific construction by its id among a garrison building constructions array.
   * @param building Given garrison building.
   * @param constructionId Given construction id.
   * @param strict Sets whether an error is thrown when no construction index is found.
   */
  static findBuildingConstruction(building: IGarrisonBuilding, id: ObjectId, strict?: true): { construction: IOperatedConstruction; index: number };
  static findBuildingConstruction(building: IGarrisonBuilding, id: ObjectId, strict: false): { construction: IOperatedConstruction; index: number } | { index: - 1 };
  static findBuildingConstruction(building: IGarrisonBuilding, id: ObjectId, strict?: boolean) {
    const { constructions } = building;
    const returnedObj = {} as { construction: IOperatedConstruction; index: number };

    for (let index = 0; index < constructions.length; index++) {
      if (!constructions[index]?._id.equals(id)) continue;
      returnedObj.construction = constructions[index];
      returnedObj.index = index;
      break;
    }
    
    if (_h.isObjectEmpty(returnedObj) && strict)
      throw new ErrorHandler(404, `Construction with id '${id}' couldn't be found in building '${building._id}'.`);

    return _h.isObjectEmpty(returnedObj) ? { index: -1 } : returnedObj;
  }

  ///////////////////////////////////////
  // 🧮 COMPUTATIONS
  ///////////////////////////////////////

  /**
   * Compute the amount of available food based on available farms.
   * @param moment The current moment.
   * @param buildings Garrison buildings.
   */
  static computeAvailableFood(moment: Date, buildings: IGarrisonBuilding[], harvestAmount: number) {
    const farms = buildings.filter(building => building.code === 'farm');
    if (farms.length === 0) return 0;

    let total = 0;

    for (const farm of farms) {
      const currentLevel = this
        .computeBuildingCurrentLevel(
          moment,
          'extension',
          farm.constructions
        );

      let factor = 0;
      if (currentLevel === 0) factor = 1;
      else if (currentLevel > 0)
        factor = Math.pow(this.getFactor('decreased'), currentLevel);
      
      total += harvestAmount * factor;
    }
    return total;
  }
  
  /**
   * Compute the quantity of available units on the basis of a given garrison unit.
   * @param moment The current moment.
   * @param units Given garrison unit.
   */
  static computeAvailableUnits(moment: Date, units: IGarrisonUnit) {
    const unavailable = units
      .state
      .assignments
      .filter(a => a.endDate.getTime() > moment.getTime())
      .map(a => +a.quantity)
      .reduce((prev, next) => prev + next, 0);

    return units.quantity - unavailable;
  }

  /**
   * Compute the current improvement level of a garrison building.
   * @param moment The current moment.
   * @param improvementType Building improvement type.
   * @param constructions Building constructions.
   */
  static computeBuildingCurrentLevel(
    moment: Date,
    improvementType: IBuildingImprovementType,
    constructions: IOperatedConstruction[]
  ) {
    const improvements = constructions
      .filter(
        c => moment.getTime() > c.endDate.getTime() &&
        c.improvement?.type === improvementType
      );
    if (improvements.length === 0) {
      // no improvement was found, but is the building at least been instantiated ?
      if (constructions.length > 1) return -1;
    }

    return improvements
      .map(c => <number>c.improvement?.level)
      .reduce((prev, next) => next > prev ? next : prev, 0);
  }

  /**
   * Compute the cost of constructing a building, or improving one.
   * @param instantiationCost Building basic instantiation cost.
   * @param improvementLevel The level on which to improve the building.
   */
  static computeConstructionCost(
    instantiationCost: IBuildingCost,
    improvementLevel = 0
  ) {
    const getPowerFactor = (factor = this.getFactor('default')) => {
      return Math.pow(factor, improvementLevel);
    };
    return {
      gold: instantiationCost.gold * getPowerFactor(),
      wood: instantiationCost.wood * getPowerFactor(),
      plot: instantiationCost.plot * getPowerFactor(
        this.getFactor('decreased')
      )
    } as IBuildingCost;
  }

  /**
   * Compute both the duration and the minimum required workforce to construct a building or to improve one.
   * @param workforce Given workforce.
   * @param building Static building to be instantiate or improved.
   * @param improvementLevel The level on which to improve the building.
   */
  static computeConstructionDurationAndWorkforce(
    workforce: number,
    building: IBuilding,
    improvementLevel = 0
  ) {
    let { duration, minWorkforce } = building.instantiation;
    duration = duration * Math.pow(this.getFactor('decreased'), improvementLevel);
    minWorkforce = minWorkforce * Math.pow(2, improvementLevel);
    
    // apply bonus: each additionnal worker reduces duration by 3%
    return {
      duration: duration * Math.pow(0.97, workforce - minWorkforce),
      minWorkforce
    };
  }

  /**
   * Compute the cost of training one or more units.
   * @param instantiationCost Unit basic instantiation cost.
   * @param quantity The quantity of units to instantiate.
   */
  static computeTrainingCost(
    instantiationCost: IUnitCost,
    quantity: number
  ) {
    return {
      gold: instantiationCost.gold * quantity,
      wood: instantiationCost.wood * quantity,
      food: instantiationCost.food * quantity
    } as IUnitCost;
  }

  ///////////////////////////////////////
  // ❔ CHECKS
  ///////////////////////////////////////

  /**
   * Check whether a building allows peasants to be assigned to it.
   * @param staticBuilding Static building.
   */
  static checkBuildingAllowsHarvest(staticBuilding: IBuilding, strict?: true): NonNullable<IBuilding['harvest']>;
  static checkBuildingAllowsHarvest(staticBuilding: IBuilding, strict: false): NonNullable<IBuilding['harvest']> | null;
  static checkBuildingAllowsHarvest(staticBuilding: IBuilding, strict?: boolean) {
    if (!staticBuilding.harvest && strict)
      throw new ErrorHandler(400, `No peasant can be assigned at building '${staticBuilding.code}'.`);
    
    return staticBuilding.harvest ? 
      staticBuilding.harvest as NonNullable<IBuilding['harvest']>
      : null;
  }

  /**
   * Check whether all building constructions are finished.
   * @param moment The current moment
   * @param building Garrison building.
   */
  static checkBuildingAvailability(moment: Date, building: IGarrisonBuilding, strict?: true): boolean;
  static checkBuildingAvailability(moment: Date, building: IGarrisonBuilding, strict: false): boolean;
  static checkBuildingAvailability(moment: Date, building: IGarrisonBuilding, strict?: boolean) {
    const available = building
      .constructions
      .every(c => moment.getTime() > c.endDate.getTime());

    if (!available && strict) throw new ErrorHandler(412, `Building '${building._id}' is already being processed.`);

    return available;
  }

  /**
   * Check whether a building can be improved.
   * @param building Garrison building.
   * @param staticBuilding Static building.
   * @param improvementType Building improvement type.
   */
  static checkBuildingImprovable(
    moment: Date,
    building: IGarrisonBuilding,
    staticBuilding: IBuilding,
    improvementType: 'extension'): { extension: NonNullable<IBuilding['extension']>; currentLevel: number; nextExtension: number; };
  static checkBuildingImprovable(
    moment: Date,
    building: IGarrisonBuilding,
    staticBuilding: IBuilding,
    improvementType: 'upgrade'): { currentLevel: number; nextUpgrade: NonNullable<IBuilding['upgrades']>[any]; };
  static checkBuildingImprovable(
    moment: Date,
    building: IGarrisonBuilding,
    staticBuilding: IBuilding,
    improvementType: IBuildingImprovementType
  ) {
    switch (improvementType) {
      case 'upgrade': {
        if (!staticBuilding.upgrades || staticBuilding.upgrades.length === 0)
          throw new ErrorHandler(412, `Building '${staticBuilding.code}' cannot be upgraded.`);
        
        const currentLevel = this
          .computeBuildingCurrentLevel(
            moment,
            improvementType,
            building.constructions
          );
        const nextUpgrades = staticBuilding
            .upgrades
            .filter(u => u.level >= currentLevel + 1);
        if (_h.isArrayEmpty(nextUpgrades))
            throw new ErrorHandler(400, `No upgrade is available at this level (${currentLevel}).`);

        return {
          currentLevel,
          nextUpgrade: nextUpgrades[0]
        }
      }

      case 'extension': {
        if (!staticBuilding.extension)
          throw new ErrorHandler(412, `Building '${staticBuilding.code}' cannot be extended.`);
        
        const currentLevel = this
          .computeBuildingCurrentLevel(
            moment,
            improvementType,
            building.constructions
          );
        const extensionMax = staticBuilding.extension.maxLevel as number;
        if (currentLevel + 1 > extensionMax)
          throw new ErrorHandler(400, `No extension is available at this level (${currentLevel}).`);

        return {
          extension: staticBuilding.extension as IBuilding['extension'],
          currentLevel,
          nextExtension: currentLevel + 1
        };
      }

      default:
        break;
    }
  }
  
  /**
   * Check whether a garrison is eligible to construct a building, or improve one.
   * @param moment The current moment.
   * @param resources Garrison current resources.
   * @param instantiationCost The building basic instantiation cost.
   */
  static checkConstructionPaymentCapacity(
    moment: Date,
    resources: IGarrisonResources,
    instantiationCost: IBuildingCost
  ): IGarrisonResources
  static checkConstructionPaymentCapacity(
    moment: Date,
    resources: IGarrisonResources,
    instantiationCost: IBuildingCost,
    improvementType: IBuildingImprovementType,
    constructions: IOperatedConstruction[]
  ): IGarrisonResources
  static checkConstructionPaymentCapacity(
    moment: Date,
    resources: IGarrisonResources,
    instantiationCost: IBuildingCost,
    improvementType?: IBuildingImprovementType,
    constructions?: IOperatedConstruction[]
  ) {
    let nextLevel;
    if (improvementType && constructions) {
      nextLevel = this.computeBuildingCurrentLevel(
        moment,
        improvementType,
        constructions
      ) + 1;
    } else nextLevel = 0;

    // compute the cost by taking into account the current building upgrade level + 1
    const cost = this.computeConstructionCost(instantiationCost, nextLevel);
    if (resources.gold - cost.gold < 0 ||
      cost.wood - cost.wood < 0 ||
      resources.plot - cost.plot < 0)
      throw new ErrorHandler(412, 'Not enough resources.');

    return {
      ...resources,
      gold: resources.gold - cost.gold,
      wood: resources.wood - cost.wood,
      plot: resources.plot - cost.plot
    } as IGarrisonResources;
  }

  /**
   * Check whether at least one peasant is harvesting some resource.
   * @param peasants Given garrison peasants.
   * @param buildings Given garrison buildings.
   * @param buildingCode Type of harvest building.
   */
  static checkHarvestingPeasants(
    peasants: IGarrisonUnit,
    buildings: IGarrisonBuilding[],
    buildingCode: string
  ) {
    return peasants
      .state
      .assignments
      .some(assignment => {
        return assignment.type === 'harvest'
        && buildings.find(building => {
            if (!assignment.buildingId) return;

            if (
              building._id.equals(assignment.buildingId)
              && building.code === buildingCode
            ) return building;
          });
      });
  }

  /**
   * Check whether a garrison is eligible to train one or more units.
   * @param moment The current moment.
   * @param resources Garrison current resources.
   * @param buildings Garrison buildings.
   * @param instantiationCost The unit basic instantiation cost.
   * @param quantity The quantity of units to train.
   * @param harvestAmount The amount of resource a farm is giving when it gets constructed.
   */
  static checkTrainingPaymentCapacity(
    moment: Date,
    resources: IGarrisonResources,
    buildings: IGarrisonBuilding[],
    instantiationCost: IUnitCost,
    quantity: number,
    harvestAmount: number
  ) {
    const availableFood = this
      .computeAvailableFood(
        moment,
        buildings,
        harvestAmount
      );
    
    const cost = this.computeTrainingCost(instantiationCost, quantity);
    if (resources.gold - cost.gold < 0 ||
      cost.wood - cost.wood < 0 ||
      availableFood - cost.food < 0)
      throw new ErrorHandler(412, 'Not enough resources.');

    return {
      ...resources,
      gold: resources.gold - cost.gold,
      wood: resources.wood - cost.wood,
      food: resources.food - cost.food
    } as IGarrisonResources;
  }

  /**
   * Check whether a garrison meets a building instantiation/upgrade requirements.
   * @param moment The current moment.
   * @param requirements Building instantiation/upgrade construction requirements.
   * @param buildings Garrison buildings.
   */
  static checkStandardRequirements(
    moment: Date,
    requirements: IRequiredBuilding[],
    buildings: IGarrisonBuilding[]
  ) {
    const unfulfilled = requirements
      .some(building => {
        // simply look for the required building inside garrison existing buildings
        const existing = buildings.find(garrBuilding => garrBuilding.code === building.code);
        if (!existing) return true;

        if (building.upgradeLevel) {
          // is the building at the required upgrade level ?
          const upgraded = existing
            .constructions
            .find(construction => <number>construction.improvement?.level >= <number>building.upgradeLevel);
          if (!upgraded) return true;

          // is the building still being processed for this specific upgrade ?
          if (upgraded.endDate.getTime() > moment.getTime()) return true;
        }
        return false;
      });

    if (unfulfilled) throw new ErrorHandler(412, 'Garrison does not fulfill upgrade requirements.');
  }

  /**
   * Check whether a garrison meets a building extension requirements.
   * @param moment The current moment.
   * @param requirements Building extension construction requirements.
   * @param buildings Garrison buildings.
   * @param nextExtension Next extension level to reach.
   */
  static checkExtensionConstructionRequirements(
    moment: Date,
    requirements: IRequiredBuildingForExtensionLevel[],
    buildings: IGarrisonBuilding[],
    nextExtension: number
  ) {
    const unfulfilled = requirements
      .some(building => {
        // simply look for the required building inside garrison existing buildings
        const existing = buildings.find(garrBuilding => garrBuilding.code === building.code);
        if (!existing) return true;

        if (building.upgradeLevel && (building.level === nextExtension)) {
          // is the building at the required upgrade level ?
          const upgraded = existing
            .constructions
            .find(construction => <number>construction.improvement?.level >= <number>building.upgradeLevel);
          if (!upgraded) return true;

          // is the building still being processed for this specific upgrade ?
          if (upgraded.endDate.getTime() > moment.getTime()) return true;
        }
        return false;
      });

    if (unfulfilled) throw new ErrorHandler(412, 'Garrison does not fulfill upgrade requirements.');
  }
  
  /**
   * Check whether a given workforce is coherent with both a building construction pre-requesites and the garrison available workforce.
   * Please note that this construction can either be an instantiation or an improvement such as an upgrade or an extension.
   * @param moment The current moment.
   * @param workforce The given workforce.
   * @param peasants Garrison peasants.
   * @param building Static building to be instantiate or improved.
   * @param improvementType Building improvement type.
   */
  static checkWorkforceCoherence(
    moment: Date,
    workforce: number,
    peasants: IGarrisonUnit,
    building: IBuilding
  ): void
  static checkWorkforceCoherence(
    moment: Date,
    workforce: number,
    peasants: IGarrisonUnit,
    building: IBuilding,
    improvementType: IBuildingImprovementType,
    constructions: IOperatedConstruction[],
  ): void
  static checkWorkforceCoherence(
    moment: Date,
    workforce: number,
    peasants: IGarrisonUnit,
    building: IBuilding,
    improvementType ? : IBuildingImprovementType,
    constructions ? : IOperatedConstruction[],
  ) {
    // first checks are made in relation to given garrison peasants
    if (workforce > peasants.quantity)
      throw new ErrorHandler(400, `Given workforce (${workforce}) cannot be greater than current peasant quantity (${peasants.quantity}).`);

    const availablePeasants = this.computeAvailableUnits(moment, peasants);
    if (workforce > availablePeasants)
      throw new ErrorHandler(412, `Given workforce (${workforce}) cannot be greater than current available peasants quantity (${availablePeasants}).`);

    // second checks are made in relation to building next construction workforce requirements
    let {
      minWorkforce
    } = building.instantiation;

    if (constructions && improvementType) {
      const currentLevel = this.computeBuildingCurrentLevel(moment, improvementType, constructions);
      minWorkforce = minWorkforce * Math.pow(2, currentLevel + 1);
    }

    if (workforce < minWorkforce)
      throw new ErrorHandler(400, `Given workforce (${workforce}) cannot be less than minimum required workforce (${minWorkforce}).`);

    if (workforce > minWorkforce * 2)
      throw new ErrorHandler(
        400,
        `Given workforce (${workforce}) cannot be greater than the double of minimum required workforce (${minWorkforce}*2 = ${minWorkforce * 2}).`
      );
  }

  static checkUnitAssignmentCoherence(
    moment: Date,
    quantity: number,
    units: IGarrisonUnit,
    building: IGarrisonBuilding
  ) {
    if (quantity > units.quantity)
      throw new ErrorHandler(400, `Given quantity (${quantity}) cannot be greather than current unit quantity (${units.quantity}).`);

    const availableUnits = this.computeAvailableUnits(moment, units);
    if (quantity > availableUnits)
      throw new ErrorHandler(400, `Given quantity (${quantity}) cannot be greather than current available unit quantity (${units.quantity}).`);

    this.checkBuildingAvailability(moment, building);
  }
}

export default Helper;