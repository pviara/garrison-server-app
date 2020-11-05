import {
  IList,
  IListDataEntity
} from '../list/model';

/**
 * The representation of a list of banners. 
 */
export interface IBannerList extends IList {
  dataset: IBannerListDataEntity[];
}

/**
 * The representation of a banner inside the banner list dataset.
 */
interface IBannerListDataEntity extends IListDataEntity {
  /**
   * In other words : faction (like the *horde* or the *alliance*).
   */
  side: string;
}