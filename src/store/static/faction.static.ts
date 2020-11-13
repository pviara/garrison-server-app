import { IStaticEntity } from '../../config/models/data/static/types';

export const factionList: { type: string, dataset: IStaticEntity[] } = {
  type: 'FACTIONS',
  dataset: [{
    code: 'alliance',
    word: 'alliance'
  },
  {
    code: 'horde',
    word: 'horde'
  }]
};