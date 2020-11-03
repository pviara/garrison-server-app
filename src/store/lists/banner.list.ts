import { IBannerList } from '../../config/models/list/banner.list.model';

export const bannerList: IBannerList = {
  id: 1,
  type: 'BANNERS',
  dataset: [{
    code: 'lordaeron',
    word: 'lordaeron',
    side: 'alliance'
  },
  {
    code: 'ironforge',
    word: 'ironforge',
    side: 'alliance'
  },
  {
    code: 'stromgarde',
    word: 'stromgarde',
    side: 'alliance'
  },
  {
    code: 'warsong',
    word: 'warsong',
    side: 'horde'
  },
  {
    code: 'blackrocks',
    word: 'blackrock',
    side: 'horde'
  },
  {
    code: 'frostwolf',
    word: 'frostwolf',
    side: 'horde'
  }]
};