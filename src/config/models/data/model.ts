// all existing database types
export type DatabaseStaticType = 'DB_NAME_STATIC';
export type DatabaseDynamicType = 'DB_NAME_DYNAMIC';
export type DatabaseType = DatabaseStaticType | DatabaseDynamicType;

export type DatabaseURICloudType = 'cloud';
export type DatabaseURILocalType = 'local';
export type DatabaseURIType = DatabaseURICloudType | DatabaseURILocalType;