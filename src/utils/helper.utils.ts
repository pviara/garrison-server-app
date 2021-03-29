import { ObjectId } from 'mongodb';

/**
 * Default helper class. Contains static methods everyone can use! ✨
 */
class Helper {
  /**
   * Add some time to an existing date.
   * @param date Existing date.
   * @param time Time to add.
   */
  static addTime(date: Date, time: number) {
    return new Date(date.getTime() + time);
  }

  /**
   * Check whether all given object ids are the same one.
   * @param objectIds Given object ids.
   */
  static areSameObjectId(...objectIds: ObjectId[]) {
    return objectIds.some(someObjId => {
      return objectIds.every(eachObjId => eachObjId.equals(someObjId));
    });
  }

  /**
   * Check whether all given strings are the same one. ⚠ Case insensitive!
   * @param strings Given strings.
   */
  static areSameString(...strings: string[]) {
    return strings.some(someString => {
      return strings.every(eachString => eachString.toLowerCase() === someString.toLowerCase());
    });
  }

  /**
   * Compute the elapsed minutes between two dates.
   * @param before Initial date.
   * @param after After date.
   */
  static computeElapsedMinutes(before: Date, after: Date) {
    const result = after.getTime() - before.getTime();
    return result >= 0 ? result / 1000 / 60 : 0;
  }
  
  /**
   * Capitalize every single word of a string.
   * @param string String on which to apply capitalizing.
   */
  static capitalize(string: string) {
    // lowercase the whole string
    string = string.toLowerCase();

    // build the new capitalized string
    return string.replace(/(^.|-.| .)/g, (char) => char.toUpperCase());
  }

  /**
   * Check whether the given object is empty or not.
   * @param obj Given object.
   */
  static isObjectEmpty(obj?: object) {
    if (!obj) return true;
    return (Object.keys(obj).length === 0) ? true : false;
  }

  /**
   * Check whether the given array is empty or not.
   * @param arr Given array.
   */
  static isArrayEmpty(arr: any[]) {
    return arr.length === 0;
  }

  /**
   * Remove accents from a string.
   * @param string String on which to remove accents.
   * @param toLowerCase Must the given string be returned as lowercase ?
   */
  static normalize(string: string, toLowerCase: boolean = false) {
    const normalized = string.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return toLowerCase ? normalized.toLowerCase() : normalized;
  }
}

export default Helper;