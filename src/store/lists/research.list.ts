import { IResearchList } from '../../config/models/list/research.list.model';

export const researchList: IResearchList = {
  id: 6,
  type: 'RESEARCHES',
  dataset: [{
    code: 'melee-attack-global',
    word: 'sharp swords',
    instantiation: {
      cost: {
        gold: 100,
        wood: 50
      },
      duration: 60,
      required: {
        buildings: {
          code: 'barracks'
        }
      }
    },
    target: {
      entity: 'UNITS',
      identifier: {
        fightType: 'melee'
      }
    },
    actions: [{
      statistics: 'points.attack.min',
      operation: '+',
      value: 1
    },
    {
      statistics: 'points.attack.max',
      operation: '+',
      value: 2
    }]
  },
  {
    code: 'melee-defense-global',
    word: 'sharp swords',
    instantiation: {
      cost: {
        gold: 100,
        wood: 50
      },
      duration: 60,
      required: {
        buildings: {
          code: 'barracks'
        }
      }
    },
    target: {
      entity: 'UNITS',
      identifier: {
        fightType: 'melee'
      }
    },
    actions: [{
      statistics: 'points.attack.max',
      operation: '+',
      value: 2
    }]
  }]
};