import { IList, IListDataEntity } from '../list/model';

/**
 * The representation of a list of zones. 
 */
export interface IZoneList extends IList {
  dataset: IZoneListDataEntity[];
}

/**
 * The representation of a banner inside the zone list dataset.
 */
interface IZoneListDataEntity extends IListDataEntity {
  /**
   * In other words : faction (like the *horde* or the *alliance*).
   */
  side: string;
}