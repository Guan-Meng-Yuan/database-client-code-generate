export enum DatabaseType {
  MYSQL = "MySQL",
  PG = "PostgreSQL",
  SQLITE = "SQLite",
  MSSQL = "SqlServer",
  MONGO_DB = "MongoDB",
  ES = "ElasticSearch",
  REDIS = "Redis",
  SSH = "SSH",
  FTP = "FTP",
}
export enum ModelType {
  MONGO_CONNECTION = "mongoConnection",
  MONGO_TABLE = "mongoTable",
  /**
   * ftp
   */
  FTP_CONNECTION = "ftpConnection",
  FTP_FOLDER = "ftpFolder",
  FTP_FILE = "ftpFile",
  FTP_Link = "ftpLink",
  /**
   * ssh
   */
  SSH_CONNECTION = "sshConnection",
  FOLDER = "folder",
  FILE = "file",
  Link = "link",
  /**
   * redis
   */
  REDIS_CONNECTION = "redisConnection",
  REDIS_FOLDER = "redisFolder",
  REDIS_KEY = "redisKey",
  /**
   * ElasticSearch
   */
  ES_CONNECTION = "esConnection",
  ES_INDEX = "esIndex",
  ES_COLUMN = "esColumn",
  /**
   * database
   */
  CONNECTION = "connection",
  CATALOG = "catalog",
  SCHEMA = "database",
  USER_GROUP = "userGroup",
  USER = "user",
  TABLE = "table",
  COLUMN = "column",
  INFO = "info",
  TABLE_GROUP = "tableGroup",
  VIEW = "view",
  VIEW_GROUP = "viewGroup",
  TRIGGER_GROUP = "triggerGroup",
  TRIGGER = "trigger",
  PROCEDURE_GROUP = "procedureGroup",
  PROCEDURE = "procedure",
  FUNCTION_GROUP = "functionGroup",
  FUNCTION = "function",
  QUERY_GROUP = "queryGroup",
  QUERY = "query",
  DIAGRAM_GROUP = "diagramGroup",
  DIAGRAM = "diagram",
}
