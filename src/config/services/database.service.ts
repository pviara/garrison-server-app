import mongoose, { Connection } from 'mongoose';

import { ELogType as logType } from '../models/log/log.model';
import LoggerService from './logger.service';

import { 
  DatabaseDynamicType,
  DatabaseStaticsType,
  DatabaseType
} from '../models/data/model';

import bannerSchema from '../models/data/static/banner/banner.schema';
import buildingSchema from '../models/data/static/building/building.schema';
import characterSchema from '../models/data/character/character.schema';
import factionSchema from '../models/data/static/faction/faction.schema';
import garrisonSchema from '../models/data/garrison/garrison.schema';
import researchSchema from '../models/data/static/research/research.schema';
import unitSchema from '../models/data/static/unit/unit.schema';
import userSchema from '../models/data/user/user.schema';
import zoneSchema from '../models/data/static/zone/zone.schema';

import { bannerList } from '../../store/static/banner.static';
import { buildingList } from '../../store/static/building.static';
import { factionList } from '../../store/static/faction.static';
import { researchList } from '../../store/static/research.static';
import { unitList } from '../../store/static/unit.static';
import { zoneList } from '../../store/static/zone.static';

import { IBanner, IBannerDocument, IBannerModel } from '../models/data/static/banner/banner.types';
import { IBuilding, IBuildingDocument, IBuildingModel } from '../models/data/static/building/building.types';
import { ICharacterDocument, ICharacterModel } from '../models/data/character/character.types';
import { IFaction, IFactionDocument, IFactionModel } from '../models/data/static/faction/faction.types';
import { IGarrisonDocument, IGarrisonModel } from '../models/data/garrison/garrison.types';
import { IResearch, IResearchDocument, IResearchModel } from '../models/data/static/research/research.types';
import { IUnit, IUnitDocument, IUnitModel } from '../models/data/static/unit/unit.types';
import { IUserDocument, IUserModel } from '../models/data/user/user.types';
import { IZone, IZoneDocument, IZoneModel } from '../models/data/static/zone/zone.types';

/**
 * Application global database service.
 */
class DatabaseService {
  private _dbStaticsType: DatabaseStaticsType = 'DB_NAME_STATICS';
  private _dbDynamicType: DatabaseDynamicType = 'DB_NAME_DYNAMIC';

  private _connections: Connection[] = [];

  private _logger = new LoggerService(this.constructor.name);

  /** Retrieve statics database. */
  get statics() {
    return this._connections.find(co => co.name === process.env.DB_NAME_STATICS);
  }

  /** Retrieve dynamic database. */
  get dynamic() {
    return this._connections.find(co => co.name === process.env.DB_NAME_DYNAMIC);
  }

  /**
   * Connect and register all existing databases to the application.
   */
  async connectDatabases() {
    if (!this._connections.find(co => co.name === this._dbStaticsType))
      await this._addConnection(this._dbStaticsType);

    if (!this._connections.find(co => co.name === this._dbDynamicType))
      await this._addConnection(this._dbDynamicType);

    // init all models after having being connected to the databases
    await this._initAllModels();
  }

  /**
   * Initialize all data models.
   */
  private async _initAllModels() {
    // starting with statics database...
    this.statics?.model<IBannerDocument>('banner', bannerSchema) as IBannerModel;
    this.statics?.model<IBuildingDocument>('building', buildingSchema) as IBuildingModel;
    this.statics?.model<IFactionDocument>('faction', factionSchema) as IFactionModel;
    this.statics?.model<IResearchDocument>('research', researchSchema) as IResearchModel;
    this.statics?.model<IUnitDocument>('unit', unitSchema) as IUnitModel;
    this.statics?.model<IZoneDocument>('zone', zoneSchema) as IZoneModel;

    // fill the statics database
    await this._fillStatics();

    // ...then with dynamic database
    this.dynamic?.model<ICharacterDocument>('character', characterSchema) as ICharacterModel;
    this.dynamic?.model<IGarrisonDocument>('garrison', garrisonSchema) as IGarrisonModel;
    this.dynamic?.model<IUserDocument>('user', userSchema) as IUserModel;
  }

  /**
   * Fill statics database with the default static data from the store.
   */
  private async _fillStatics() {
    // bind each imported list to its matching imported model
    const lists = [
      { entities: bannerList,
        methods: {
          findByCode: (code: string) => (this.statics?.model('banner') as IBannerModel).findByCode(code),
          create: (entity: object) => (this.statics?.model('banner') as IBannerModel).create(entity as IBanner)
        }
      },

      { entities: buildingList,
        methods: {
          findByCode: (code: string) => (this.statics?.model('building') as IBuildingModel).findByCode(code),
          create: (entity: object) => (this.statics?.model('building') as IBuildingModel).create(entity as IBuilding)
        }
      },

      { entities: factionList,
        methods: {
          findByCode: (code: string) => (this.statics?.model('faction') as IFactionModel).findByCode(code),
          create: (entity: object) => (this.statics?.model('faction') as IFactionModel).create(entity as IFaction)
        }
      },

      { entities: researchList,
        methods: {
          findByCode: (code: string) => (this.statics?.model('research') as IResearchModel).findByCode(code),
          create: (entity: object) => (this.statics?.model('research') as IResearchModel).create(entity as IResearch)
        }
      },

      { entities: unitList,
        methods: {
          findByCode: (code: string) => (this.statics?.model('unit') as IUnitModel).findByCode(code),
          create: (entity: object) => (this.statics?.model('unit') as IUnitModel).create(entity as IUnit)
        }
      },
        
      { entities: zoneList,
        methods: {
          findByCode: (code: string) => (this.statics?.model('zone') as IZoneModel).findByCode(code),
          create: (entity: object) => (this.statics?.model('zone') as IZoneModel).create(entity as IZone)
        }
      },
    ];

    for (const list of lists) {
      // add each entity contained in the list to its matching collection
      // only if it doesn't already exist (of course 🤷‍♂️)
      for (const entity of list.entities) {
        if (await list.methods.findByCode(entity.code)) continue;
        
        this._logger.log(logType.pending, `Creating entity ${entity.code}...`);
        const created = await list.methods.create(entity);
        
        if (created) this._logger.log(logType.pass, `Created entity ${entity.code} (${created.id})`);
        else this._logger.log(logType.fail, `Failed to create entity ${entity.code}`);
      }
    }
  }

  /**
    * Add a new db-typed connection into the service connections.
    * @param dbType Database type.
   */
  private async _addConnection(dbType: DatabaseType) {
    /**
     * Create a new connection using the given database type.
     */
    const createConnection = async (dbType: DatabaseType) => {
      /**
       * Assemble the right URI according to the given database type.
       * @param dbType Database type.
       */
      const retrieveURI = (dbType: DatabaseType) => {
        // make sure the environment variables exist
        if (
          !process.env.DB_URI
          || !process.env[dbType]
          || !process.env.DB_USER_NAME
          || !process.env.DB_USER_PASSWORD
        ) throw new Error('Couldn\'t retrieve either database URI or name, user or password from .env file.');
  
        return process.env.DB_URI
          .replace('<username>', process.env.DB_USER_NAME)
          .replace('<password>', process.env.DB_USER_PASSWORD)
          .replace('<dbname>', process.env[dbType] as string);
      };

      const defaultOptions = {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
      };

      return await mongoose.createConnection(retrieveURI(dbType), defaultOptions);
    };

    try {
      this._logger.log(logType.pending, `Connecting to database ${dbType}...`);
      this._connections = this._connections.concat(await createConnection(dbType));
      this._logger.log(logType.pass, `Connected to database ${dbType}`);
    } catch (err) {
      this._logger.log(logType.fail, `Failed to connect to database ${dbType}`);
      throw err;
    }

  }
}

export = new DatabaseService();