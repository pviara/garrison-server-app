import { IResearch } from '../../config/models/data/static/research/research.types';

export const researchList: { type: string, dataset: IResearch[] } = {
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
      requiredEntities: {
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
      requiredEntities: {
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