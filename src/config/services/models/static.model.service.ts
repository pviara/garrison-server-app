import { ELogType as logType } from '../../models/log/log.model';
import IMonitored from '../../models/IMonitored';
import MonitoringService from '../monitoring/monitoring.service';

import { Connection } from 'mongoose';

import bannerSchema from '../../models/data/static/banner/banner.schema';
import buildingSchema from '../../models/data/static/building/building.schema';
import factionSchema from '../../models/data/static/faction/faction.schema';
import researchSchema from '../../models/data/static/research/research.schema';
import unitSchema from '../../models/data/static/unit/unit.schema';
import zoneSchema from '../../models/data/static/zone/zone.schema';

import { bannerList } from '../../../store/static/banner.static';
import { buildingList } from '../../../store/static/building.static';
import { factionList } from '../../../store/static/faction.static';
import { researchList } from '../../../store/static/research.static';
import { unitList } from '../../../store/static/unit.static';
import { zoneList } from '../../../store/static/zone.static';

import {
  IBanner,
  IBannerDocument,
  IBannerModel
} from '../../models/data/static/banner/banner.types';
import {
  IBuilding,
  IBuildingDocument,
  IBuildingModel
} from '../../models/data/static/building/building.types';
import {
  IFaction,
  IFactionDocument,
  IFactionModel
} from '../../models/data/static/faction/faction.types';
import {
  IResearch,
  IResearchDocument,
  IResearchModel
} from '../../models/data/static/research/research.types';
import {
  IUnit,
  IUnitDocument,
  IUnitModel
} from '../../models/data/static/unit/unit.types';
import {
  IZone,
  IZoneDocument,
  IZoneModel
} from '../../models/data/static/zone/zone.types';

/**
 * Mongoose static models service.
 */
export default class StaticModelService implements IMonitored {
  private _monitor = new MonitoringService(this.constructor.name);

  /** Retrieve all static models. */
  get models() {
    return [
      this._connection.model('banner'),
      this._connection.model('building'),
      this._connection.model('faction'),
      this._connection.model('research'),
      this._connection.model('unit'),
      this._connection.model('zone')
    ]
  }
  
  /** Retrieve class monitoring service. */
  get monitor() {
    return this._monitor;
  }
  
  constructor(private _connection: Connection) {}

  /**
   * Setup static models.
   * @param connection Given static connection.
   */
  async setupModels(connection = this._connection) {
    this._monitor.log(logType.pending, 'Initializing mongoose static models...');

    connection?.model<IBannerDocument>('banner', bannerSchema) as IBannerModel;
    connection?.model<IBuildingDocument>('building', buildingSchema) as IBuildingModel;
    connection?.model<IFactionDocument>('faction', factionSchema) as IFactionModel;
    connection?.model<IResearchDocument>('research', researchSchema) as IResearchModel;
    connection?.model<IUnitDocument>('unit', unitSchema) as IUnitModel;
    connection?.model<IZoneDocument>('zone', zoneSchema) as IZoneModel;

    connection
      .modelNames()
      .forEach(name => {
        this.monitor.log(logType.pass, `Initialized mongoose static model '${name}'`);
      });

    await this._fill(connection);
  }

  /**
   * Fill static database with the default static data from the store.
   * @param connection Given static connection.
   */
  private async _fill(connection = this._connection) {
    // bind each imported list to its matching imported model
    const lists = [
      { entities: bannerList,
        methods: {
          findByCode: (code: string) => (connection?.model('banner') as IBannerModel).findByCode(code),
          create: (entity: object) => (connection?.model('banner') as IBannerModel).create(entity as IBanner)
        }
      },

      { entities: buildingList,
        methods: {
          findByCode: (code: string) => (connection?.model('building') as IBuildingModel).findByCode(code),
          create: (entity: object) => (connection?.model('building') as IBuildingModel).create(entity as IBuilding)
        }
      },

      { entities: factionList,
        methods: {
          findByCode: (code: string) => (connection?.model('faction') as IFactionModel).findByCode(code),
          create: (entity: object) => (connection?.model('faction') as IFactionModel).create(entity as IFaction)
        }
      },

      { entities: researchList,
        methods: {
          findByCode: (code: string) => (connection?.model('research') as IResearchModel).findByCode(code),
          create: (entity: object) => (connection?.model('research') as IResearchModel).create(entity as IResearch)
        }
      },

      { entities: unitList,
        methods: {
          findByCode: (code: string) => (connection?.model('unit') as IUnitModel).findByCode(code),
          create: (entity: object) => (connection?.model('unit') as IUnitModel).create(entity as IUnit)
        }
      },
        
      { entities: zoneList,
        methods: {
          findByCode: (code: string) => (connection?.model('zone') as IZoneModel).findByCode(code),
          create: (entity: object) => (connection?.model('zone') as IZoneModel).create(entity as IZone)
        }
      },
    ];

    for (const list of lists) {
      // add each entity contained in the list to its matching collection
      // only if it doesn't already exist (of course 🤷‍♂️)
      for (const entity of list.entities) {
        if (await list.methods.findByCode(entity.code)) continue;
        
        this._monitor.log(logType.pending, `Creating entity ${entity.code}...`);
        const created = await list.methods.create(entity);
        
        if (created) this._monitor.log(logType.pass, `Created entity ${entity.code} (${created.id})`);
        else this._monitor.log(logType.fail, `Failed to create entity ${entity.code}`);
      }
    }
  }
}