import ErrorHandler from '../../../../config/models/error/error-handler.model';

import {
  ObjectId
} from 'mongodb';

import {
  IBuildingImprovementType,
  IGarrisonBuilding,
  IGarrisonDocument,
  IGarrisonResearch,
  IGarrisonResources,
  IGarrisonUnit,
  IOperatedConstruction,
  IOperatedProject,
  IUnitAssignment
} from '../../../../config/models/data/dynamic/garrison/garrison.types';

import {
  IBuilding,
  IBuildingCost,
  IRequiredBuilding,
  IRequiredBuildingForExtensionLevel
} from '../../../../config/models/data/static/building/building.types';

import {
  IResearch
} from '../../../../config/models/data/static/research/research.types';

import {
  IStaticEntityCost
} from '../../../../config/models/data/static/static.types';

import {
  IUnit,
  IUnitCost
} from '../../../../config/models/data/static/unit/unit.types';

import _h from '../../../../utils/helper.utils';

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
   * @param strict Sets whether an error is thrown when no building is found.
   * @returns Either an IUnitAssignment or (maybe) null if strict mode is set to false.
   */
  static findBuildingAssignment(
    unit: IGarrisonUnit,
    buildingId: ObjectId,
    type: IUnitAssignment['type'],
    strict?: true
  ): { assignment: IUnitAssignment; index: number }
  static findBuildingAssignment(
    unit: IGarrisonUnit,
    buildingId: ObjectId,
    type: IUnitAssignment['type'],
    strict: false
  ): { assignment: IUnitAssignment; index: number } | { index: -1 }
  static findBuildingAssignment(
    unit: IGarrisonUnit,
    buildingId: ObjectId,
    type: IUnitAssignment['type'],
    strict: boolean = true
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
   * Find a specific assignment inside a garrison unit.
   * @param unit Given garrison unit.
   * @param assignmentId Given assignment id.
   * @param strict Sets whether an error is thrown when no building is found.
   * @returns Either an IUnitAssignment or (maybe) null if strict mode is set to false.
   */
  static findUnitAssignment(
    unit: IGarrisonUnit,
    assignmentId: ObjectId,
    strict?: true
  ): { assignment: IUnitAssignment; index: number }
  static findUnitAssignment(
    unit: IGarrisonUnit,
    assignmentId: ObjectId,
    strict: false
  ): { assignment: IUnitAssignment; index: number } | { index: -1 }
  static findUnitAssignment(
    unit: IGarrisonUnit,
    assignmentId: ObjectId,
    strict: boolean = true
  ) {
    const { assignments } = unit.state;
    const returnedObj = {} as { assignment: IUnitAssignment; index: number };

    for (let index = 0; index < assignments.length; index++) {
      const assignment = assignments[index];
      if (!assignment._id?.equals(assignmentId)) continue;

      returnedObj.assignment = assignment;
      returnedObj.index = index;
    }
    
    if (_h.isObjectEmpty(returnedObj) && strict)
      throw new ErrorHandler(404, `Assignment with id '${assignmentId}' couldn't be found in '${unit.code}' assignments.`);

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
  static findBuilding(garrison: IGarrisonDocument, id: ObjectId, strict: boolean = true) {
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
   * Find a specific research by its id inside a garrison.
   * @param garrison Given garrison document.
   * @param id Given ObjectId.
   * @param strict Sets whether an error is thrown when no research is found.
   * @returns Either an IGarrisonResearch or (maybe) null if strict mode is set to false.
   */
  static findResearch(garrison: IGarrisonDocument, id: ObjectId, strict?: true): { research: IGarrisonResearch; index: number };
  static findResearch(garrison: IGarrisonDocument, id: ObjectId, strict: false): { research: IGarrisonResearch; index: number } | { index: -1 };
  static findResearch(garrison: IGarrisonDocument, id: ObjectId, strict: boolean = true) {
    const { researches } = garrison.instances;
    const returnedObj = {} as { research: IGarrisonResearch; index: number };

    for (let index = 0; index < researches.length; index++) {
      if (!(researches[index]._id.equals(id))) continue;
      returnedObj.research = researches[index];
      returnedObj.index = index;
      break;
    }
    
    if (_h.isObjectEmpty(returnedObj) && strict)
      throw new ErrorHandler(404, `Research with id '${id}' couldn't be found in garrison '${garrison._id}'.`);

    return _h.isObjectEmpty(returnedObj) ? { index: -1 } : returnedObj;
  }

  /**
   * Find a specific research by its code inside a garrison.
   * @param garrison Given garrison document.
   * @param id Given research code.
   * @param strict Sets whether an error is thrown when no research is found.
   * @returns Either an IGarrisonResearch or (maybe) null if strict mode is set to false.
   */
  static findResearchByCode(garrison: IGarrisonDocument, code: string, strict?: true): { research: IGarrisonResearch; index: number };
  static findResearchByCode(garrison: IGarrisonDocument, code: string, strict: false): { research: IGarrisonResearch; index: number } | { index: -1 };
  static findResearchByCode(garrison: IGarrisonDocument, code: string, strict: boolean = true) {
    const { researches } = garrison.instances;
    const returnedObj = {} as { research: IGarrisonResearch; index: number };

    for (let index = 0; index < researches.length; index++) {
      if (!(researches[index].code === code)) continue;
      returnedObj.research = researches[index];
      returnedObj.index = index;
      break;
    }
    
    if (_h.isObjectEmpty(returnedObj) && strict)
      throw new ErrorHandler(404, `Research with code '${code}' couldn't be found in garrison '${garrison._id}'.`);

    return _h.isObjectEmpty(returnedObj) ? { index: -1 } : returnedObj;
  }

  /**
   * Find a specific unit by its code inside a garrison.
   * @param garrison Given garrison document.
   * @param code Given code.
   * @param strict Sets whether an error is thrown when no unit is found.
   * @returns Either an IGarrisonUnit or (maybe) null if strict mode is set to false.
   */
  static findUnit(garrison: IGarrisonDocument, code: string, strict?: true): { unit: IGarrisonUnit; index: number };
  static findUnit(garrison: IGarrisonDocument, code: string, strict: false): { unit: IGarrisonUnit; index: number } | { index: - 1 };
  static findUnit(garrison: IGarrisonDocument, code: string, strict: boolean = true) {
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
  static findBuildingConstruction(building: IGarrisonBuilding, id: ObjectId, strict: boolean = true) {
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

  /**
   * Find a specific project by its id among a garrison research projects array.
   * @param research Given garrison research.
   * @param id Given project id.
   * @param strict Sets whether an error is thrown when no project index is found.
   */
  static findResearchProject(research: IGarrisonResearch, id: ObjectId, strict?: true): { project: IOperatedProject; index: number };
  static findResearchProject(research: IGarrisonResearch, id: ObjectId, strict: false): { project: IOperatedProject; index: number } | { index: - 1 };
  static findResearchProject(research: IGarrisonResearch, id: ObjectId, strict: boolean = true) {
    const { projects } = research;
    const returnedObj = {} as { project: IOperatedProject; index: number };

    for (let index = 0; index < projects.length; index++) {
      if (!projects[index]?._id.equals(id)) continue;
      returnedObj.project = projects[index];
      returnedObj.index = index;
      break;
    }
    
    if (_h.isObjectEmpty(returnedObj) && strict)
      throw new ErrorHandler(404, `Project with id '${id}' couldn't be found in research '${research._id}'.`);

    return _h.isObjectEmpty(returnedObj) ? { index: -1 } : returnedObj;
  }

  ///////////////////////////////////////
  // 🧮 COMPUTATIONS
  ///////////////////////////////////////

  /**
   * Compute the amount of available food.
   * @param moment The current moment.
   * @param buildings Garrison buildings.
   * @param harvestAmount The amount of resource a farm is giving when it gets constructed.
   * @param staticUnits Static units from store.
   */
  static computeAvailableFood(
    moment: Date,
    buildings: IGarrisonBuilding[],
    harvestAmount: number,
    units: IGarrisonUnit[],
    staticUnits: IUnit[]
  ) {
    const farms = buildings.filter(building => building.code === 'farm');
    if (farms.length === 0) return 0;

    // by default garrisons are created with 3 foods
    let totalFood = 3;

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
      
      totalFood += harvestAmount * factor;
    }

    for (const unit of units) {
      const staticUnit = staticUnits.find(sU => sU.code === unit.code);
      if (!staticUnit) continue;

      const { food: cost } = staticUnit
        .instantiation
        .cost;

      totalFood -= unit.quantity * cost;
    }
    
    return Math.floor(totalFood);
  }

  /**
   * Compute the amount of available plots.
   * @param moment The current moment.
   * @param buildings Garrison buildings.
   * @param staticBuildings Static buildings from store.
   */
  static computeAvailablePlots(
    moment: Date,
    buildings: IGarrisonBuilding[],
    staticBuildings: IBuilding[]
  ) {
    let totalPlots = 60;
    
    for (const building of buildings) {
      const staticBuilding = staticBuildings.find(sB => sB.code === building.code);
      if (!staticBuilding) continue;

      let improvementType: IBuildingImprovementType | null = null;
      if (staticBuilding.upgrades && staticBuilding.upgrades.length > 0)
        improvementType = 'upgrade';
      else if (staticBuilding.extension)
        improvementType = 'extension';
        
      if (!improvementType) {
        totalPlots -= staticBuilding.instantiation.cost.plot;
        continue;
      }

      const currentLevel = this
        .computeBuildingCurrentLevel(
          moment,
          improvementType,
          building.constructions
        );

      for (let i = 0; i < currentLevel + 1; i++) {
        const cost = this
          .computeConstructionCost(
            staticBuilding.instantiation.cost,
            i
          );
        totalPlots -= cost.plot;
      }
    }

    return Math.floor(totalPlots);
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
      gold: Math.floor(instantiationCost.gold * getPowerFactor()),
      wood: Math.floor(instantiationCost.wood * getPowerFactor()),
      plot: Math.floor(
        instantiationCost.plot * getPowerFactor(
          this.getFactor('decreased')
        )
      )
    } as IBuildingCost;
  }

  /**
   * Compute both the duration and the minimum required workforce to construct a building or to improve one.
   * @param moment The current moment.
   * @param workforce Given workforce.
   * @param building Static building to be instantiate or improved.
   * @param improvementLevel The level on which to improve the building.
   * @param researches Garrison researches (in case one want to apply bonuses).
   */
  static computeConstructionDurationAndWorkforce(
    moment: Date,
    workforce: number,
    building: IBuilding,
    improvementLevel: number,
    researches: IGarrisonResearch[]
  ) {
    let { duration, minWorkforce } = building.instantiation;
    duration = duration * Math.pow(this.getFactor('decreased'), improvementLevel);
    minWorkforce = minWorkforce * Math.pow(2, improvementLevel);
    
    // compute bonus according to applied researches
    let bonus = 0.97;
    const matchingResearch = researches
      .find(research => research.code === 'improved-construction');

    if (matchingResearch) {
      bonus -= this
        .computeResearchCurrentLevel(
          moment,
          matchingResearch.projects
        ) / 100;
    }
    
    // apply bonus: each additionnal worker reduces duration by 3%
    return {
      duration: duration * Math.pow(bonus, workforce - minWorkforce),
      minWorkforce
    };
  }

  /**
   * Compute the global limit of a specific type of resource (either gold or wood).
   * @param moment The current moment.
   * @param harvestCode Type of harvest building.
   * @param buildings Garrison buildings.
   */
  static computeGlobalProfitLimit(
    moment: Date,
    harvestCode: 'goldmine' | 'sawmill',
    buildings: IGarrisonBuilding[]
  ) {
    const harvestBuildings = buildings
      .filter(building => {
        const available = this.checkBuildingAvailability(
          moment,
          building,
          false
        );
        if (available && building.code === harvestCode)
          return building;
      });

    let profitLimit = 0;
    for (const harvestBuilding of harvestBuildings) {
      const currentLevel = this
        .computeBuildingCurrentLevel(
          moment,
          'extension',
          harvestBuilding.constructions
        );
      const factor = currentLevel > 0 ? currentLevel : 1;
      profitLimit += 180 * factor;
    }

    return profitLimit;
  }

  /**
   * Compute the cost of launching a research project.
   * @param instantiationCost Research basic instantiation cost.
   * @param projectLevel The level on which to launch the research.
   */
  static computeResearchCost(
    instantiationCost: IStaticEntityCost,
    projectLevel = 0
  ) {
    const getPowerFactor = (factor = this.getFactor('default')) => {
      return Math.pow(factor, projectLevel);
    };
    return {
      gold: Math.floor(instantiationCost.gold * getPowerFactor()),
      wood: Math.floor(instantiationCost.wood * getPowerFactor())
    } as IStaticEntityCost;
  }

  /**
   * Compute the current level of a garrison research.
   * @param moment The current moment.
   * @param projects Research projects.
   */
  static computeResearchCurrentLevel(
    moment: Date,
    projects: IOperatedProject[]
  ) {
    const finished = projects
      .filter(p => moment.getTime() > p.endDate.getTime());

    return finished
      .map(p => <number>p.level)
      .reduce((prev, next) => next > prev ? next : prev, 0);
  }

  /**
   * Compute both the duration and the minimum required workforce to launch a research project.
   * @param workforce Given workforce.
   * @param research Static research to be instantiated.
   * @param projectLevel The level on which to improve the research.
   */
  static computeResearchDurationAndWorkforce(
    workforce: number,
    research: IResearch,
    projectLevel = 0
  ) {
    let { duration, minWorkforce } = research.instantiation;
    duration = duration * Math.pow(this.getFactor('decreased'), projectLevel);
    minWorkforce = minWorkforce * Math.pow(2, projectLevel);
    
    // apply bonus: each additionnal researcher reduces duration by 3%
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
  static checkBuildingAllowsHarvest(staticBuilding: IBuilding, strict: boolean = true) {
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
  static checkBuildingAvailability(moment: Date, building: IGarrisonBuilding, strict: boolean = true) {
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
   * Check whether the number of built buildings with the given type does not exceed the limitation of still improvable buildings.
   * @param moment The current moment.
   * @param staticBuilding Static building.
   * @param buildings Garrison buildings.
   */
  static checkConstructionLimit(
    moment: Date,
    staticBuilding: IBuilding,
    buildings: IGarrisonBuilding[]
  ) {
    const builtBuildings = buildings
      .filter(building => building.code === staticBuilding.code);

    let improvable = 0;
    for (const built of builtBuildings) {
      if (
        staticBuilding.upgrades?.length === 0
        && !staticBuilding.extension
      ) continue;
      
      const improvementType: IBuildingImprovementType = !_h
        .isObjectEmpty(staticBuilding.extension)
          ? 'extension'
          : 'upgrade';

      const currentLevel = this
        .computeBuildingCurrentLevel(
          moment,
          improvementType,
          built.constructions
        );
      
      switch (improvementType) {
        case 'extension': {
          if (!staticBuilding.extension) throw new Error(); // this is *never* supposed to happen

          const { maxLevel } = staticBuilding.extension;
          if (currentLevel < maxLevel) improvable++;
          break;
        }

        case 'upgrade': {
          if (!staticBuilding.upgrades) throw new Error(); // this is *never* supposed to happen

          const maxLevel = staticBuilding
            .upgrades
            .map(u => <number>u.level)
            .reduce((prev, next) => next > prev ? next : prev, 0);

          if (currentLevel < maxLevel) improvable++;
          break;
        }
      }
    }

    // "+1" or the building that's about to be instantiated
    if (improvable + 1 >= 5)
      throw new ErrorHandler(412, `The building '${staticBuilding.code}' cannot be instantiated since other buildings need to be improved first.`);
  }
  
  /**
   * Check whether a garrison is eligible to construct a building, or improve one.
   * @param moment The current moment.
   * @param resources Garrison current resources.
   * @param instantiationCost The building basic instantiation cost.
   */
  static checkConstructionPaymentCapacity(
    moment: Date,
    buildings: IGarrisonBuilding[],
    staticBuildings: IBuilding[],
    resources: IGarrisonResources,
    instantiationCost: IBuildingCost
  ): IGarrisonResources
  static checkConstructionPaymentCapacity(
    moment: Date,
    buildings: IGarrisonBuilding[],
    staticBuildings: IBuilding[],
    resources: IGarrisonResources,
    instantiationCost: IBuildingCost,
    improvementType: IBuildingImprovementType,
    constructions: IOperatedConstruction[]
  ): IGarrisonResources
  static checkConstructionPaymentCapacity(
    moment: Date,
    buildings: IGarrisonBuilding[],
    staticBuildings: IBuilding[],
    resources: IGarrisonResources,
    instantiationCost: IBuildingCost,
    improvementType?: IBuildingImprovementType,
    constructions?: IOperatedConstruction[]
  ) {
    const availablePlots = this
      .computeAvailablePlots(
        moment,
        buildings,
        staticBuildings
      );
    
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
      availablePlots - cost.plot < 0)
      throw new ErrorHandler(412, 'Not enough resources.');
      
    return {
      ...resources,
      gold: resources.gold - cost.gold,
      wood: resources.wood - cost.wood
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
   * Check whether a garrison is eligible to launch a specific research.
   * @param moment 
   * @param resources 
   * @param instantiationCost 
   * @param projects 
   */
  static checkResearchPaymentCapacity(
    moment: Date,
    resources: IGarrisonResources,
    instantiationCost: IStaticEntityCost,
    projects?: IOperatedProject[]
  ) {
    const nextLevel = this
      .computeResearchCurrentLevel(
        moment,
        projects || []
      ) + 1;
    
    const cost = this.computeResearchCost(instantiationCost, nextLevel);
    if (resources.gold - cost.gold < 0 ||
      cost.wood - cost.wood < 0)
      throw new ErrorHandler(412, 'Not enough resources.');
      
    return {
      ...resources,
      gold: resources.gold - cost.gold,
      wood: resources.wood - cost.wood
    } as IGarrisonResources;
  }

  /**
   * Check whether a garrison is eligible to train one or more units.
   * @param moment The current moment.
   * @param resources Garrison current resources.
   * @param units Garrison units.
   * @param buildings Garrison buildings.
   * @param instantiationCost The unit basic instantiation cost.
   * @param quantity The quantity of units to train.
   * @param harvestAmount The amount of resource a farm is giving when it gets constructed.
   * @param staticUnits Static units from store.
   */
  static checkTrainingPaymentCapacity(
    moment: Date,
    resources: IGarrisonResources,
    buildings: IGarrisonBuilding[],
    units: IGarrisonUnit[],
    instantiationCost: IUnitCost,
    quantity: number,
    harvestAmount: number,
    staticUnits: IUnit[]
  ) {
    const availableFood = this
      .computeAvailableFood(
        moment,
        buildings,
        harvestAmount,
        units,
        staticUnits
      );
    
    const cost = this.computeTrainingCost(instantiationCost, quantity);
    if (resources.gold - cost.gold < 0 ||
      cost.wood - cost.wood < 0 ||
      availableFood - cost.food < 0)
      throw new ErrorHandler(412, 'Not enough resources.');

    return {
      ...resources,
      gold: resources.gold - cost.gold,
      wood: resources.wood - cost.wood
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

  static checkTrainingLimit(
    moment: Date,
    code: string,
    desiredQuantity: number,
    units: IGarrisonUnit[],
    staticUnits: IUnit[],
    buildings: IGarrisonBuilding[],
    staticBuildings: IBuilding[],
  ) {
    const staticUnit = staticUnits
      .find(sU => sU.code === code) as IUnit;
    const { main: mainTypes } = staticUnit
      .statistics
      .types;

    const concernedStaticBuildings = [] as {
      building: IBuilding;
      trainLimit: {
        unitType: string;
        quantity: number;
      };
    }[];
    for (const staticBuilding of staticBuildings) {
      if (!staticBuilding.trainLimits) continue;

      const concerned = staticBuilding
        .trainLimits
        .find(trainLimit => {
          return mainTypes.find(type => type === trainLimit.unitType);
        });
      if (concerned) concernedStaticBuildings.push({
        building: staticBuilding,
        trainLimit: concerned
      });
    }
    if (concernedStaticBuildings.length === 0) return;

    let trainLimit = 0;
    for (const staticBuilding of concernedStaticBuildings) {
      const dynamicBuildings = buildings.filter(dB => dB.code === staticBuilding.building.code);

      let improvementType: IBuildingImprovementType | null = null;
      if (staticBuilding.building.upgrades && staticBuilding.building.upgrades.length > 0)
        improvementType = 'upgrade'
      else if (staticBuilding.building.extension)
        improvementType = 'extension';
      
      for (const dynamicBuilding of dynamicBuildings) {
        let factor = 1;
        if (improvementType) {
          const currentLevel = this
            .computeBuildingCurrentLevel(
              moment,
              improvementType,
              dynamicBuilding.constructions
            );
          if (currentLevel > 0) factor = Math.pow(2, currentLevel);

          trainLimit += staticBuilding
            .trainLimit
            .quantity * factor;
          continue;
        }
      }
    }

    const unit = units.find(unit => unit.code === code);
    if ((unit?.quantity || 0) + desiredQuantity > trainLimit)
      throw new ErrorHandler(412, `Reached limit of trainable '${code}'.`);
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
  static checkBuildingWorkforceCoherence(
    moment: Date,
    workforce: number,
    peasants: IGarrisonUnit,
    building: IBuilding
  ): void
  static checkBuildingWorkforceCoherence(
    moment: Date,
    workforce: number,
    peasants: IGarrisonUnit,
    building: IBuilding,
    improvementType: IBuildingImprovementType,
    constructions: IOperatedConstruction[],
  ): void
  static checkBuildingWorkforceCoherence(
    moment: Date,
    workforce: number,
    peasants: IGarrisonUnit,
    building: IBuilding,
    improvementType?: IBuildingImprovementType,
    constructions?: IOperatedConstruction[],
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

  /**
   * Check whether a given workforce is coherent with both a research launch pre-requesites and the garrison available workforce.
   * @param moment The current moment.
   * @param workforce The given workforce.
   * @param researchers Garrison researchers.
   * @param research Static research to be instantiate or improved.
   * @param projects Current research operated projects.
   */
  static checkResearchWorkforceCoherence(
    moment: Date,
    workforce: number,
    researchers: IGarrisonUnit,
    research: IResearch,
    projects?: IOperatedProject[]
  ) {
    // first checks are made in relation to given garrison researchers
    if (workforce > researchers.quantity)
      throw new ErrorHandler(400, `Given workforce (${workforce}) cannot be greater than current researchers quantity (${researchers.quantity}).`);
    
    const availableResearchers = this.computeAvailableUnits(moment, researchers);
    if (workforce > availableResearchers)
      throw new ErrorHandler(412, `Given workforce (${workforce}) cannot be greater than current available researchers quantity (${availableResearchers}).`);

    // second checks are made in relation to research next project workforce requirements
    let {
      minWorkforce
    } = research.instantiation;
      
    if (projects) {
      const currentLevel = this.computeResearchCurrentLevel(moment, projects);
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
      throw new ErrorHandler(400, `Given quantity (${quantity}) cannot be greater than current unit quantity (${units.quantity}).`);

    const availableUnits = this.computeAvailableUnits(moment, units);
    if (quantity > availableUnits)
      throw new ErrorHandler(400, `Given quantity (${quantity}) cannot be greater than current available unit quantity (${units.quantity}).`);

    this.checkBuildingAvailability(moment, building);
  }
}

export default Helper;