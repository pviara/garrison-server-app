import { DatabaseType } from './data/model';

import { Connection } from 'mongoose';

/**
 * The representation of a specific database service.
 */
export interface ISpecificDatabaseService<T extends DatabaseType> {
  /** Specific database URI (either static or dynamic). */
  databaseType: T;

  /** Database setup method. */
  setupDatabase(): Promise<Connection>;
}

export type URIAssemblyCallback = (dbType: DatabaseType) => string;

export type DatabaseConnectionOptions = {
  useNewUrlParser: boolean;
  useCreateIndex: boolean;
  useFindAndModify: boolean;
  useUnifiedTopology: boolean;
};