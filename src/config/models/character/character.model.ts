import { IDocument } from '../global.model';

import { IGarrison } from '../garrison/garrison.model';

/**
 * The representation of a character.
 */
export interface ICharacter extends IDocument {
  /** Character's name. */
  name: string;

  /** Player's side details. */
  side: {
    /** The faction whose player belongs to. */
    faction: string;

    /** The banner whose player belongs to. */
    banner: string;
  };

  /** Player's garrison. */
  garrison: IGarrison;
}