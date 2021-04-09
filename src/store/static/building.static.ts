import {
  IBuilding
} from '../../config/models/data/static/building/building.types';

export const buildingList: IBuilding[] = [{
    code: 'town-hall',
    word: [{
        side: 'alliance',
        jargon: 'town hall'
      },
      {
        side: 'horde',
        jargon: 'great hall'
      }
    ],
    description: 'The Town Hall is the center of any Human settlement. You\'ll need it to build any other building, or to train any other unit.',
    instantiation: {
      cost: {
        gold: 385,
        wood: 200,
        plot: 10
      },
      minWorkforce: 3,
      duration: 200
    },
    upgrades: [{
        level: 1,
        word: [{
            side: 'alliance',
            jargon: 'keep'
          },
          {
            side: 'horde',
            jargon: 'stronghold'
          }
        ]
      },
      {
        level: 2,
        word: [{
            side: 'alliance',
            jargon: 'castle'
          },
          {
            side: 'horde',
            jargon: 'fortress'
          }
        ]
      }
    ]
  },
  {
    code: 'goldmine',
    word: 'goldmine',
    description: 'The goldmine is one of the three main harvest buildings. Once a peasant is sent there, he continuously harvests some gold. The more peasants are harvesting, the faster gold you get.',
    instantiation: {
      cost: {
        gold: 120,
        wood: 60,
        plot: 3
      },
      minWorkforce: 1,
      duration: 120,
      requiredEntities: {
        buildings: [{
          code: 'town-hall'
        }]
      }
    },
    extension: {
      requiredEntities: {
        buildings: [{
            level: 2,
            code: 'town-hall',
            upgradeLevel: 1
          },
          {
            level: 3,
            code: 'town-hall',
            upgradeLevel: 2
          }
        ]
      },
      maxLevel: 5
    },
    harvest: {
      resource: 'gold',
      amount: 3,
      maxWorkforce: 3
    }
  },
  {
    code: 'sawmill',
    word: 'sawmill',
    description: 'The sawmill is one of the three main harvest buildings. Once a peasant is sent there, he continuously harvests some wood. The more peasants are harvesting, the faster wood you get.',
    instantiation: {
      cost: {
        gold: 120,
        wood: 60,
        plot: 3
      },
      minWorkforce: 1,
      duration: 120,
      requiredEntities: {
        buildings: [{
          code: 'town-hall'
        }]
      }
    },
    extension: {
      requiredEntities: {
        buildings: [{
            level: 2,
            code: 'town-hall',
            upgradeLevel: 1
          },
          {
            level: 3,
            code: 'town-hall',
            upgradeLevel: 2
          }
        ]
      },
      maxLevel: 5
    },
    harvest: {
      resource: 'wood',
      amount: 2,
      maxWorkforce: 3
    }
  },
  {
    code: 'farm',
    word: 'farm',
    description: 'The farm is one of the three main harvest buildings. Once a farm is built, it immediatly gives you some food so you can train some new units. The resource acquisition is definitive.',
    instantiation: {
      cost: {
        gold: 80,
        wood: 20,
        plot: 2
      },
      duration: 70,
      minWorkforce: 1,
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
      }
    },
    extension: {
      requiredEntities: {
        buildings: [{
            level: 2,
            code: 'town-hall',
            upgradeLevel: 1
          },
          {
            level: 3,
            code: 'town-hall',
            upgradeLevel: 2
          }
        ]
      },
      maxLevel: 5
    },
    harvest: {
      resource: 'food',
      amount: 6
    }
  },
  {
    code: 'scout-tower',
    description: 'The scout tower is the most basic military building. It extends your field of vision and gives you between one or two plots once it is built, so that you can build some new buildings.',
    word: [{
        side: 'alliance',
        jargon: 'scout tower'
      },
      {
        side: 'horde',
        jargon: 'watch tower'
      }
    ],
    instantiation: {
      cost: {
        gold: 90,
        wood: 60,
        plot: 1
      },
      duration: 100,
      minWorkforce: 1,
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
      }
    },
    upgrades: [{
        level: 1,
        word: 'guard tower'
      },
      {
        level: 2,
        word: 'cannon tower',
        requiredEntities: {
          buildings: [{
              code: 'town-hall',
              upgradeLevel: 1
            },
            {
              code: 'workshop'
            }
          ]
        }
      }
    ]
  },
  {
    code: 'barracks',
    word: 'barracks',
    description: 'Barracks is the ultimate military building. Once built, you can train some units and go to battle. There\'s no need to say that without some barracks, you won\'t win any war.',
    instantiation: {
      cost: {
        gold: 200,
        wood: 110,
        plot: 8
      },
      duration: 160,
      minWorkforce: 3,
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
      }
    }
  },
  {
    code: 'forge',
    word: [{
        side: 'alliance',
        jargon: 'forge'
      },
      {
        side: 'horde',
        jargon: 'war mill'
      }
    ],
    description: 'The forge is a research building that once built gives you access to many researches and some new units to train. Winning a war is not only about having ten thousands footmen to hand.',
    instantiation: {
      cost: {
        gold: 140,
        wood: 80,
        plot: 3
      },
      duration: 140,
      minWorkforce: 1,
      requiredEntities: {
        buildings: [{
            code: 'town-hall'
          },
          {
            code: 'goldmine'
          },
          {
            code: 'sawmill'
          }
        ]
      }
    }
  },
  {
    code: 'workshop',
    word: [{
        side: 'alliance',
        jargon: 'workshop'
      },
      {
        side: 'horde',
        jargon: 'factory'
      }
    ],
    description: 'The workshop is a research building specialized in ennemy buildings destruction. It gives you access to new researches and some new units to train. Careful with the fire power please.',
    instantiation: {
      cost: {
        gold: 140,
        wood: 80,
        plot: 3
      },
      duration: 140,
      minWorkforce: 1,
      requiredEntities: {
        buildings: [{
            code: 'town-hall',
            upgradeLevel: 1
          },
          {
            code: 'goldmine'
          },
          {
            code: 'sawmill'
          },
          {
            code: 'forge'
          }
        ]
      },
    }
  }
];