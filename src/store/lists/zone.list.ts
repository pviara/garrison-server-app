import { IZoneList } from '../../config/models/list/zone.list.model';

export const zoneList: IZoneList = {
  id: 1,
  type: 'BANNERS',
  dataset: [{
    code: 'tirisfal-glades',
    word: 'tirisfal glades',
    side: 'alliance'
  },
  {
    code: 'dun-morogh',
    word: 'dun morogh',
    side: 'alliance'
  },
  {
    code: 'arathi',
    word: 'arathi',
    side: 'alliance'
  },
  {
    code: 'badlands',
    word: 'badlands',
    side: 'horde'
  },
  {
    code: 'burning-steppes',
    word: 'burning steppes',
    side: 'horde'
  },
  {
    code: 'loch-modan',
    word: 'loch modan',
    side: 'horde'
  }]
};