import * as vscode from "vscode";
import { DatabaseType, ModelType } from "@/enums";
export interface Node extends vscode.TreeDataProvider<Node> {
  schema?: string;
  dbType?: DatabaseType;
  contextValue?: ModelType;
  label?: string;
}

export interface TableMeta {
  getColumnNodes(): Promise<Column[]>;
  label: string;
  dbType: DatabaseType;
  comment: string;
}
export interface Column {
  column: ColumnMeta;
}
export interface ColumnMeta {
  name: string;
  type: string;
  comment: string;
  isNotNull: boolean;
  isPrimary: boolean;
  simpleType: string;
}
export interface Field {
  name: string;
  type: string;
  comment: string;
  isNotNull: boolean;
  isPrimary: boolean;
}
export interface Config {
  /**
   * 移除前缀的列
   */
  removeColumnPrefix?: string[];
  /**
   * Java项目基础包名
   */
  javaRootPackage?: string;
  /**
   * Java项目 父类Domain类名,如有泛型请添加<T>,如 BaseDomain<T>
   */
  javaSupperDomainName?: string;
  /**
   * Java项目 父类Domain包名
   */
  javaSupperDomainClassPackage?: string;
  /**
   * Java项目 父类Domain字段名
   */
  javaSupperDomainClassField?: string[];
  /**
   * Java项目 Domain包名
   */
  javaDomainPackage?: string;
  /**
   * Java项目 BaseController类名,需要泛型请加<S, T> 泛型说明: S - serviceInterface, T - DomainName
   */
  javaBaseControllerName?: string;
  /**
   * Java项目 BaseController包路径
   */
  javaBaseControllerPackage?: String;
  /**
   * Java项目 Controller包名
   */
  javaControllerPackage?: string;
  /**
   * Java项目 Controller后缀
   */
  javaControllerSuffix?: string;

  /**
   * Java项目 service接口包名
   */
  javaServiceInterfacePackage?: string;
  /**
   * Java项目 service接口后缀
   */
  javaServiceInterfaceSuffix?: string;
  /**
   * Java项目 service接口继承类名名,泛型 T:DomainName
   */
  javaIServiceName?: string;
  /**
   * Java项目 service接口继承包名
   */
  javaIServicePackage?: string;
  /**
   * Java项目 service实现包名
   */
  javaServiceImplPackage?: string;
  /**
   * Java项目 service实现后缀
   */
  javaServiceImplSuffix?: string;
  /**
   * Java项目 baseServiceImpl类名 泛型说明: M - Mapper,T - BaseDomain
   */
  javaBaseServiceImplName?: string;
  /**
   * Java项目 service实现包名
   */
  javaBaseServiceImplPackage?: string;
  /**
   * Java项目 Mapper包名
   */
  javaMapperPackage?: string;
  /**
   * Java项目 Mapper后缀
   */
  javaMapperSuffix?: string;

  /**
   * ava项目 BaseMapper类名 T: DomainName
   */
  javaBaseMapperName?: string;

  /**
   * Java项目 BaseMapper包名
   */
  javaBaseMapperPackage?: string;
  /**
   * Vue项目路径
   */
  vueProjectPath?: string;
  /**
   * VueApi接口文件路径
   */
  vueApiPath?: string;
}

export interface ClassParam extends Config {
  fields: Field[];
}
