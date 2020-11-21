import { IUnit } from '../../config/models/data/static/unit/unit.types';

export const unitList: IUnit[] = [{
    code: 'peasant',
    word: [{
      side: 'alliance',
      jargon: 'peasant'
    },
    {
      side: 'horde',
      jargon: 'peon'
    }],
    instantiation: {
      building: 'town-hall',
      cost: {
        gold: 60,
        wood: 10,
        food: 1
      },
      duration: 45
    },
    statistics: {
      types: {
        main: 'worker'
      },
      health: 70
    }
  },
  {
    code: 'militia',
    word: [{
      side: 'alliance',
      jargon: 'militia'
    },
    {
      side: 'horde',
      jargon: 'watcher'
    }],
    instantiation: {
      building: 'town-hall',
      cost: {
        gold: 95,
        wood: 0,
        food: 2
      },
      duration: 60
    },
    statistics: {
      types: {
        main: ['explorer', 'fighter'],
        fight: 'melee'
      },
      health: 120,
      attack: {
        points: {
          min: 6,
          max: 11
        },
        cooldown: 3,
        isDistance: false
      },
      defense: {
        points: {
          min: 1,
          max: 5
        },
        cooldown: 10,
        isDistance: false
      }
    }
  },
  {
    code: 'footman',
    word: [{
      side: 'alliance',
      jargon: 'footman'
    },
    {
      side: 'horde',
      jargon: 'grunt'
    }],
    instantiation: {
      building: 'barracks',
      cost: {
        gold: 135,
        wood: 0,
        food: 2
      },
      duration: 75
    },
    statistics: {
      types: {
        main: 'fighter',
        fight: 'melee'
      },
      health: 200,
      attack: {
        points: {
          min: 9,
          max: 17
        },
        cooldown: 5,
        isDistance: false
      },
      defense: {
        points: {
          min: 3,
          max: 7
        },
        cooldown: 12,
        isDistance: false
      }
    }
  },
  {
    code: 'rifleman',
    word: [{
      side: 'alliance',
      jargon: 'footman'
    },
    {
      side: 'horde',
      jargon: 'headhunter'
    }],
    instantiation: {
      building: 'barracks',
      cost: {
        gold: 205,
        wood: 30,
        food: 3
      },
      duration: 85,
      requiredEntities: {
        buildings: [{
          code: 'forge'
        }]
      }
    },
    statistics: {
      types: {
        main: ['explorer', 'fighter'],
        fight: 'distance'
      },
      health: 200,
      attack: {
        points: {
          min: 9,
          max: 16
        },
        cooldown: 4,
        isDistance: true
      },
      defense: {
        points: {
          min: 2,
          max: 6
        },
        cooldown: 15,
        isDistance: false
      }
    }
  },
  {
    code: 'knight',
    word: [{
      side: 'alliance',
      jargon: 'knight'
    },
    {
      side: 'horde',
      jargon: 'wolfrider'
    }],
    instantiation: {
      building: 'barracks',
      cost: {
        gold: 310,
        wood: 50,
        food: 4
      },
      duration: 115,
      requiredEntities: {
        buildings: [{
          code: 'town-hall',
          upgradeLevel: 2
        }]
      }
    },
    statistics: {
      types: {
        main: 'fighter',
        fight: 'melee'
      },
      health: 260,
      attack: {
        points: {
          min: 18,
          max: 25
        },
        cooldown: 6,
        isDistance: false
      },
      defense: {
        points: {
          min: 5,
          max: 10
        },
        cooldown: 8,
        isDistance: false
      }
    }
  }
];