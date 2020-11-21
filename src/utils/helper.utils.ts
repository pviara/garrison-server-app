/**
 * Default helper class. Contains static methods everyone can use! ✨
 */
class Helper {
  /**
   * Remove accents from a string.
   * @param string String on which to remove accents.
   * @param toLowerCase Must the given string be returned as lowercase ?
   */
  static normalize(string: string, toLowerCase: boolean = false) {
    const normalized = string.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return toLowerCase ? normalized.toLowerCase() : normalized;
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
   * Add some time to an existing date.
   * @param date Existing date.
   * @param time Time to add.
   */
  static addTime(date: Date, time: number) {
    return new Date(date.getTime() + time);
  }
}

export default Helper;