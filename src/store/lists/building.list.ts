import { IBuildingList } from '../../config/models/list/building.list.model';

export const buildingList: IBuildingList = {
  id: 4,
  type: 'BUILDINGS',
  dataset: [{
    code: 'town-hall',
    types: 'production',
    word: [{
      side: 'alliance',
      jargon: 'town hall'
    },
    {
      side: 'horde',
      jargon: 'great hall'
    }],
    instantation: {
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
      }]
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
      }]
    }]
  },
  {
    code: 'goldmine',
    types: 'harvest',
    word: 'goldmine',
    harvest: {
      resource: 'gold',
      maxWorkforce: 7
    },
    instantation: {
      cost: {
        gold: 120,
        wood: 60,
        plot: 3
      },
      minWorkforce: 1,
      duration: 120
    },
    extension: {
      required: [{
        level: 2,
        buildings: {
          code: 'town-hall',
          upgradeLevel: 1
        }
      },
      {
        level: 3,
        buildings: {
          code: 'town-hall',
          upgradeLevel: 2
        }
      }],
      maxLevel: 5
    }
  },
  {
    code: 'sawmill',
    types: 'harvest',
    word: 'sawmill',
    harvest: {
      resource: 'wood',
      maxWorkforce: 7
    },
    instantation: {
      cost: {
        gold: 120,
        wood: 60,
        plot: 3
      },
      minWorkforce: 1,
      duration: 120
    },
    extension: {
      required: [{
        level: 2,
        buildings: {
          code: 'town-hall',
          upgradeLevel: 1
        }
      },
      {
        level: 3,
        buildings: {
          code: 'town-hall',
          upgradeLevel: 2
        }
      }],
      maxLevel: 5
    }
  },
  {
    code: 'farm',
    types: 'harvest',
    word: 'farm',
    harvest: {
      resource: 'food',
      gift: 6
    },
    instantation: {
      cost: {
        gold: 80,
        wood: 20,
        plot: 2
      },
      duration: 70,
      minWorkforce: 1
    },
    extension: {
      required: [{
        level: 2,
        buildings: {
          code: 'town-hall',
          upgradeLevel: 1
        }
      },
      {
        level: 3,
        buildings: {
          code: 'town-hall',
          upgradeLevel: 2
        }
      }],
      maxLevel: 5
    }
  },
  {
    code: 'scout-tower',
    types: 'military',
    word: [{
      side: 'alliance',
      jargon: 'scout tower'
    },
    {
      side: 'horde',
      jargon: 'watch tower'
    }],
    instantation: {
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
      required: {
        buildings: [{
          code: 'town-hall',
          upgradeLevel: 1
        },
        {
          code: 'workshop'
        }]
      }
    }]
  },
  {
    code: 'barracks',
    types: 'production',
    word: 'barracks',
    instantation: {
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
    types: 'research',
    word: [{
      side: 'alliance',
      jargon: 'forge'
    },
    {
      side: 'horde',
      jargon: 'war mill'
    }],
    instantation: {
      cost: {
        gold: 140,
        wood: 80,
        plot: 3
      },
      duration: 140,
      minWorkforce: 1,
      required: {
        buildings: [{
          code: 'town-hall'
        },
        {
          code: 'sawmill'
        }]
      }
    },
  },
  {
    code: 'workshop',
    types: 'research',
    word: [{
      side: 'alliance',
      jargon: 'workshop'
    },
    {
      side: 'horde',
      jargon: 'factory'
    }],
    instantation: {
      cost: {
        gold: 140,
        wood: 80,
        plot: 3
      },
      duration: 140,
      minWorkforce: 1,
      required: {
        buildings: [{
          code: 'town-hall',
          upgradeLevel: 1
        },
        {
          code: 'forge'
        }]
      },
    }
  }]
};