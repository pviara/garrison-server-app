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
  IOperatedConstruction
} from '../../../../config/models/data/dynamic/garrison/garrison.types';

import {
  IBuilding,
  IBuildingCost,
  IRequiredBuilding
} from '../../../../config/models/data/static/building/building.types';

/**
 * Garrison helper class. Contains static methods garrison repository only can use.
 */
class Helper {
  ///////////////////////////////////////
  // 🔍 SEARCHES
  ///////////////////////////////////////

  /**
   * Find a specific building by its id inside a garrison.
   * @param garrison Given garrison document.
   * @param id Given ObjectId.
   * @returns Either an IGarrisonBuilding or (maybe) null if strict mode is set to false.
   */
  static findBuilding(garrison: IGarrisonDocument, id: ObjectId, strict ? : true): IGarrisonBuilding;
  static findBuilding(garrison: IGarrisonDocument, id: ObjectId, strict: false): IGarrisonBuilding | null;
  static findBuilding(garrison: IGarrisonDocument, id: ObjectId, strict ? : boolean) {
    const result = garrison
      .instances
      .buildings
      .find(b => b._id?.equals(id));
    if (!result && strict) throw new ErrorHandler(404, `Building with buildingId '${id}' couldn't be found in garrison '${garrison._id}'.`)

    return result as IGarrisonBuilding;
  }

  /**
   * Find a specific unit by its id inside a garrison.
   * @param garrison Given garrison document.
   * @param id Given ObjectId.
   * @returns Either an IGarrisonUnit or (maybe) null if strict mode is set to false.
   */
  static findUnit(garrison: IGarrisonDocument, code: string, strict ? : true): IGarrisonUnit;
  static findUnit(garrison: IGarrisonDocument, code: string, strict: false): IGarrisonUnit | null;
  static findUnit(garrison: IGarrisonDocument, code: string, strict ? : boolean) {
    const result = garrison
      .instances
      .units
      .find(u => u.code === code);
    if (!result && strict) throw new ErrorHandler(404, `Unit with code '${code}' couldn't be found in garrison '${garrison._id}'.`);

    return result as IGarrisonUnit;
  }

  ///////////////////////////////////////
  // 🧮 COMPUTATIONS
  ///////////////////////////////////////

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
    return constructions
      .filter(
        c => moment.getTime() > c.endDate.getTime() &&
        c.improvement?.type === improvementType
      )
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
    const getPowerFactor = (factor = 1.6) => {
      return Math.pow(factor, improvementLevel);
    };
    return {
      gold: instantiationCost.gold * getPowerFactor(),
      wood: instantiationCost.wood * getPowerFactor(),
      plot: instantiationCost.plot * getPowerFactor(1.3)
    } as IBuildingCost;
  }

  /**
   * Compute the duration of constructing a building or improving one.
   * @param workforce Given workforce.
   * @param building Static building to be instantiate or improved.
   * @param improvementLevel The level on which to improve the building.
   */
  static computeConstructionDuration(
    workforce: number,
    building: IBuilding,
    improvementLevel = 0
  ) {
    let { duration, minWorkforce } = building.instantiation;
    duration = duration * Math.pow(1.3, improvementLevel);
    minWorkforce = minWorkforce * Math.pow(2, improvementLevel);
    
    // apply bonus: each additionnal worker reduces duration by 3%
    return duration * Math.pow(0.97, workforce - minWorkforce);
  }

  ///////////////////////////////////////
  // ❔ CHECKS
  ///////////////////////////////////////

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
    improvementType ? : IBuildingImprovementType,
    constructions ? : IOperatedConstruction[]
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
   * Check whether a garrison meets a specific building instantiation requirements.
   * @param requirements Building instantiation requirements.
   * @param buildings Garrison buildings.
   * @param moment The current moment.
   */
  static checkConstructionRequirements(
    requirements: IRequiredBuilding[],
    buildings: IGarrisonBuilding[],
    moment: Date
  ) {
    const fulfilled = requirements
      .some(building => {
        // simply look for the required building inside garrison existing buildings
        const existing = buildings.find(garrBuilding => garrBuilding.code === building.code);
        if (!existing) return false;

        if (building.upgradeLevel) {
          // is the building at the required upgrade level ?
          const upgraded = existing
            .constructions
            .find(construction => <number> construction.improvement?.level >= < number > building.upgradeLevel);
          if (!upgraded) return false;

          // is the building still being processed for this specific upgrade ?
          if (upgraded.endDate.getTime() > moment.getTime()) return false;
        }
        return true;
      });

    if (!fulfilled) throw new ErrorHandler(412, 'Garrison does not fulfill upgrade requirements.');
  }

  /**
   * Check whether a given workforce is coherent with both a building construction pre-requesites and the garrison available workforce.
   * Please note that this construction can either be an instantiation or an improvement such as an upgrade or an extension.
   * @param moment The current moment.
   * @param workforce The given workforce.
   * @param peasants Garrison peasants.
   * @param building Static building to be instantiate or improved.
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
}

export default Helper;