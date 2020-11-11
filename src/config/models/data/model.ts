/**
 * A document is a data record from any datastore
 * ("any" because no DBMS has been chosen for now).
 */
export interface IDocument {
  /** Unique document identifier. */
  id: number;
}