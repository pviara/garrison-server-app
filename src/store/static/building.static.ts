import { IBuilding } from '../../config/models/data/static/building/building.types';

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
    instantiation: {
      cost: {
        gold: 120,
        wood: 60,
        plot: 3
      },
      minWorkforce: 1,
      duration: 120
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
        }]
      },
      maxLevel: 5
    },
    harvest: {
      resource: 'gold',
      maxWorkforce: 7
    }
  },
  {
    code: 'sawmill',
    word: 'sawmill',
    instantiation: {
      cost: {
        gold: 120,
        wood: 60,
        plot: 3
      },
      minWorkforce: 1,
      duration: 120
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
        }]
      },
      maxLevel: 5
    },
    harvest: {
      resource: 'wood',
      maxWorkforce: 7
    }
  },
  {
    code: 'farm',
    word: 'farm',
    instantiation: {
      cost: {
        gold: 80,
        wood: 20,
        plot: 2
      },
      duration: 70,
      minWorkforce: 1
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
        }]
      },
      maxLevel: 5
    },
    harvest: {
      resource: 'food',
      gift: 6
    }
  },
  {
    code: 'scout-tower',
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
      minWorkforce: 1
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
    instantiation: {
      cost: {
        gold: 200,
        wood: 110,
        plot: 8
      },
      duration: 160,
      minWorkforce: 3
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
            code: 'forge'
          }
        ]
      },
    }
  }
];