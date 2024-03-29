import { IResearch } from '../../config/models/data/static/research/research.types';

export const researchList: IResearch[] = [{
    code: 'improved-construction',
    word: 'Build faster',
    description: 'Increase your workers productivity when constructing buildings. Any additional enroled worker above minimum workforce will reduce construction time by extra 1%.',
    instantiation: {
      cost: {
        gold: 250,
        wood: 250
      },
      minWorkforce: 1,
      duration: 200,
      requiredEntities: {
        buildings: [{
          code: 'town-hall'
        }]
      },
      givenExperience: 1
    },
    bonus: 1
  },
  {
    code: 'improved-harvest',
    word: 'Harvest faster',
    description: 'Increase your workers productivity when harvesting resources. Any enroled worker will harvest 1 extra resource per minute.',
    instantiation: {
      cost: {
        gold: 250,
        wood: 250
      },
      minWorkforce: 1,
      duration: 200,
      requiredEntities: {
        buildings: [{
          code: 'town-hall'
        },
        {
          code: 'goldmine'
        },
        {
          code: 'sawmill'
        }]
      },
      givenExperience: 1
    },
    bonus: 1
  }
];