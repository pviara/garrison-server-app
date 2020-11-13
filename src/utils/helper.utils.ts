/**
 * Default helper class. Contains static methods everyone can use! ✨
 */
class Helper {
  /**
   * Remove accents from a string.
   * @param string String on which to remove accents.
   */
  static normalize(string: string) {
    return string.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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
}

export default Helper;