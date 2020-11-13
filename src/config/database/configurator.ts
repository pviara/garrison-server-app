import mongoose from 'mongoose';

import { IBuilding } from '../models/data/static/building/building.types';
import { IBanner } from '../models/data/static/banner/banner.types';
import { IFaction } from '../models/data/static/faction/faction.types';
import { IResearch } from '../models/data/static/research/research.types';
import { IUnit } from '../models/data/static/unit/unit.types';
import { IZone } from '../models/data/static/zone/zone.types';

import { bannerList } from '../../store/static/banner.static';
import { buildingList } from '../../store/static/building.static';
import { factionList } from '../../store/static/faction.static';
import { researchList } from '../../store/static/research.static';
import { unitList } from '../../store/static/unit.static';
import { zoneList } from '../../store/static/zone.static';

import { bannerModel } from '../models/data/static/banner/banner.model';
import { buildingModel } from '../models/data/static/building/building.model';
import { factionModel } from '../models/data/static/faction/faction.model';
import { researchModel } from '../models/data/static/research/research.model';
import { unitModel } from '../models/data/static/unit/unit.model';
import { zoneModel } from '../models/data/static/zone/zone.model';

/**
 * Database configurator.
 */
class DbConfigurator {
  /**
   * Connect the app to the default database.
   */
  async connect() {
    try {
      console.log('> \u001b[36mConnecting to database...\u001b[0m');
      await mongoose.connect(
        this._retrieveURI(),
        {
          useNewUrlParser: true,
          useCreateIndex: true,
          useFindAndModify: false,
          useUnifiedTopology: true
        }
      );
      console.log('> \u001b[90mConnected to database\u001b[0m');
    } catch (err) {
      console.log('> \u001b[31mFailed to connect to database\u001b[0m');
      console.error(err);
    }
  }

  /**
   * Insert static data inside database static collections.
   */
  async insertStaticData() {
    // bind each imported list to its matching imported model
    const lists = [
      { entities: bannerList,
        methods: {
          findOne: (code: string) => bannerModel.findOne({ code }),
          create: (entity: object) => bannerModel.create(entity as IBanner)
        }
      },

      { entities: buildingList,
        methods: {
          findOne: (code: string) => buildingModel.findOne({ code }),
          create: (entity: object) => buildingModel.create(entity as IBuilding)
        }
      },

      { entities: factionList,
        methods: {
          findOne: (code: string) => factionModel.findOne({ code }),
          create: (entity: object) => factionModel.create(entity as IFaction)
        }
      },

      { entities: researchList,
        methods: {
          findOne: (code: string) => researchModel.findOne({ code }),
          create: (entity: object) => researchModel.create(entity as IResearch)
        }
      },

      { entities: unitList,
        methods: {
          findOne: (code: string) => unitModel.findOne({ code }),
          create: (entity: object) => unitModel.create(entity as IUnit)
        }
      },
        
      { entities: zoneList,
        methods: {
          findOne: (code: string) => zoneModel.findOne({ code }),
          create: (entity: object) => zoneModel.create(entity as IZone)
        }
      },
    ];

    for (const list of lists) {
      // add each entity contained in the list to its matching collection
      // only if it doesn't already exist (of course 🤷‍♂️)
      for (const entity of list.entities) {
        if (await list.methods.findOne(entity.code)) continue;

        console.log(`> \u001b[36mDATABASE: Creating entity ${entity.code}...\u001b[0m`);
        const created = await list.methods.create(entity);
        
        if (created) console.log(`> \u001b[90mDATABASE: Created entity ${entity.code} (${created.id})...\u001b[0m`);
        else console.log(`> \u001b[31mDATABASE: Failed to create entity ${entity.code}\u001b[0m`); 
      }
    }
  }

  /**
   * Assembles the right database URI according to environment variables.
   */
  private _retrieveURI() {
    if (!process.env.DB_URI || !process.env.DB_NAME || !process.env.DB_PASSWORD)
      throw new Error('Couldn\'t retrieve either database URI, user or password from .env file.')
  
    return process.env.DB_URI
      .replace('<password>', process.env.DB_PASSWORD)
      .replace('<dbname>', process.env.DB_NAME);

  }
}

export = new DbConfigurator();