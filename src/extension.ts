import * as vscode from "vscode";
import * as fs from "fs-extra";
import { ColumnMeta, TableMeta } from "./common/constants";
import path = require("path");
import domainCompile from "./common/domain";
import controllerCompile from "./common/controller";
import serviceInterfaceCompile from "./common/serviceInterface";
import mapperCompile from "./common/mapper";
import { caseCamel, casePascal } from "@zerodep/case";
import serviceImplCompile from "./common/serviceImpl";
enum Java {
  JAVA_BASE_PATH = "src/main/java",
  JAVA_RESOURCE = "src/main/java/resources",
  SUFFIX = ".java",
}
/**
 * 设置非lang包
 * @param domainParam
 */
const setPackages = (domainParam: ClassParam) => {
  if (domainParam.fields) {
    const packageImportSet = new Set<string>();
    domainParam.fields.forEach((x) => {
      if (x.type === "Date") {
        packageImportSet.add("import java.util.Date;");
      }
      if (x.type === "BigDecimal") {
        packageImportSet.add("import java.math.BigDecimal;");
      }
    });
    domainParam.importPackages = packageImportSet;
  }
};

/**
 * 获取字段类型
 * @param column
 */
const getJavaFieldType = (column: ColumnMeta) => {
  let simpleType = column.simpleType.toLocaleLowerCase();
  let type = column.type.toLocaleLowerCase();
  if (
    simpleType === "varchar" ||
    simpleType === "char" ||
    simpleType === "json" ||
    simpleType === "linestring" ||
    simpleType === "longtext" ||
    simpleType === "text"
  ) {
    return "String";
  } else if (simpleType === "bigint") {
    return "Long";
  } else if (
    simpleType === "datetime" ||
    simpleType === "timestamp" ||
    simpleType === "data" ||
    simpleType === "time"
  ) {
    return "Date";
  } else if (simpleType === "double") {
    return "Double";
  } else if (simpleType === "decimal" || simpleType === "numeric") {
    return "BigDecimal";
  } else if (simpleType === "float") {
    return "Float";
  } else if (simpleType === "int" || simpleType === "integer") {
    return "Integer";
  } else if (simpleType === "tinyint") {
    const match = type.match(/\((\d+)\)/);
    if (match) {
      if (match[1] === "1") {
        return "Boolean";
      }
    }
    return "Integer";
  }
  return "String";
};
interface ClassParam {
  // 类名
  domainName: string;
  //类注释
  domainComment: string;
  // 类包名
  domainPackageName?: string;

  controllerName: string;
  controllerPackageName?: string;
  controllerPath?: string;

  //interface包名
  serviceInterfacePackageName?: string;
  serviceInterfaceName: string;

  serviceImplName: string;
  serviceImplPackageName?: string;

  mapperName: string;
  mapperPackageName?: string;

  fields?: FieldParam[];
  importPackages?: Set<string>;
  basePackageName: string;

  hasNotNull?: boolean;
}
interface FieldParam {
  //字段名
  name: string;
  //字段注释
  comment: string;
  type: string;
  isNotNull?: boolean;
}
/**
 * 删除父类字段
 * @param domainParam
 */
const removeParentFields = (domainParam: ClassParam) => {
  if (domainParam.fields) {
    const newFields = domainParam.fields.filter(
      (field) =>
        field.name !== "id" &&
        field.name !== "createTime" &&
        field.name !== "updateTime" &&
        field.name !== "deleted"
    );
    domainParam.fields = newFields;
  }
};
//生成Java Domain代码
const genDomain = (
  packagePath: string,
  domainName: string,
  domainParam: ClassParam
) => {
  removeParentFields(domainParam);
  setPackages(domainParam);
  fs.ensureDirSync(packagePath);
  fs.writeFile(
    path.resolve(packagePath, `${domainName}${Java.SUFFIX}`),
    domainCompile(domainParam),
    { flag: "w", encoding: "utf-8" }
  );
};
const genController = (
  packagePath: string,
  controllerName: string,
  classParam: ClassParam
) => {
  fs.ensureDirSync(packagePath);
  fs.writeFile(
    path.resolve(packagePath, `${controllerName}${Java.SUFFIX}`),
    controllerCompile(classParam),
    { flag: "w", encoding: "utf-8" }
  );
};
const genServiceInterface = (
  packagePath: string,
  serviceInterfaceName: string,
  classParam: ClassParam
) => {
  fs.ensureDirSync(packagePath);
  fs.writeFile(
    path.resolve(packagePath, `${serviceInterfaceName}${Java.SUFFIX}`),
    serviceInterfaceCompile(classParam),
    { flag: "w", encoding: "utf-8" }
  );
};
const genServiceImpl = (
  packagePath: string,
  serviceImplName: string,
  classParam: ClassParam
) => {
  fs.ensureDirSync(packagePath);
  fs.writeFile(
    path.resolve(packagePath, `${serviceImplName}${Java.SUFFIX}`),
    serviceImplCompile(classParam),
    { flag: "w", encoding: "utf-8" }
  );
};
const genMapper = (
  packagePath: string,
  mapperName: string,
  classParam: ClassParam
) => {
  fs.ensureDirSync(packagePath);
  fs.writeFile(
    path.resolve(packagePath, `${mapperName}${Java.SUFFIX}`),
    mapperCompile(classParam),
    { flag: "w", encoding: "utf-8" }
  );
};
export function activate(context: vscode.ExtensionContext) {
  // TODO 生成所有表代码

  let genAllCode = vscode.commands.registerCommand(
    "database-client-code-generate.code-gen-all",
    async (node: any) => {
      const config = vscode.workspace.getConfiguration(
        "database-client-code-generate"
      );
      //基础包名
      const basePackageName = config.get("javaRootPackage") as string;
      //domain 包名
      const domainPackageName = config.get("javaDomainPackage") as string;
      // controller包名
      const controllerPackageName = config.get(
        "javaControllerPackage"
      ) as string;
      //serviceInterface包名
      const serviceInterfacePackageName = config.get(
        "javaServiceInterfacePackage"
      ) as string;
      // serviceImpl包名
      const serviceImplPackageName = config.get(
        "javaServiceImplPackage"
      ) as string;
      //mapper包名
      const mapperPackageName = config.get("javaMapperPackage") as string;

      if (!basePackageName) {
        jumpToSetting(
          "database-client-code-generate.javaRootPackagePath",
          "请先配置Java项目基础包名"
        );
        return;
      }

      const workspace = vscode.workspace.workspaceFolders;
      //项目目录地址
      const dirPath = workspace && workspace[0].uri.fsPath;
      if (!dirPath) {
        vscode.window.showErrorMessage("请先选择项目文件夹");
        return;
      }

      // 类的基础包地址
      const packagePath = path.resolve(
        `${dirPath}`.trim(),
        Java.JAVA_BASE_PATH,
        basePackageName.replaceAll(".", "/").trim()
      );

      switch (node.contextValue) {
        case "database":
          const children = await node.getChildren();
          const tableItem = children.find((x: any) => x.label === "Tables");
          if (!tableItem) {
            return;
          }
          const tables = await tableItem.getChildren();
          await tables.forEach(async (table: any) => {
            const tableMeta = table.meta as TableMeta;

            const classBaseName = casePascal(tableMeta.name);
            const controllerName = `${classBaseName}Controller`;
            const serviceInterfaceName = `${classBaseName}Api`;
            const serviceImplName = `${classBaseName}Service`;
            const mapperName = `${classBaseName}Mapper`;
            const classParam: ClassParam = {
              basePackageName,
              domainName: classBaseName,
              domainComment: tableMeta.comment,
              domainPackageName,

              controllerName,
              controllerPackageName,
              controllerPath: `${caseCamel(tableMeta.name)}s`,

              serviceInterfacePackageName,
              serviceInterfaceName,

              serviceImplPackageName,
              serviceImplName,

              mapperPackageName,
              mapperName,

              fields: [],
            };

            const columnItems = await table.getColumnNodes();
            let hasNotNull = false;
            columnItems.forEach((column: any) => {
              const columnMeta = column.column as ColumnMeta;
              if (columnMeta.isNotNull && columnMeta.name !== "id") {
                hasNotNull = true;
              }
              classParam.fields &&
                classParam.fields.push({
                  isNotNull: columnMeta.isNotNull,
                  name:
                    caseCamel(columnMeta.name) === "isDeleted"
                      ? "deleted"
                      : caseCamel(columnMeta.name),
                  comment: columnMeta.comment,
                  type: getJavaFieldType(columnMeta),
                });
            });
            classParam.hasNotNull = hasNotNull;

            genDomain(
              path.resolve(
                packagePath,
                domainPackageName && domainPackageName.replaceAll(".", "/")
              ),
              classBaseName,
              classParam
            );
            genController(
              path.resolve(
                packagePath,
                controllerPackageName &&
                  controllerPackageName.replaceAll(".", "/")
              ),
              controllerName,
              classParam
            );
            genServiceInterface(
              path.resolve(
                packagePath,
                serviceInterfacePackageName &&
                  serviceInterfacePackageName.replaceAll(".", "/")
              ),
              serviceInterfaceName,
              classParam
            );
            genServiceImpl(
              path.resolve(
                packagePath,
                serviceImplPackageName &&
                  serviceImplPackageName.replaceAll(".", "/")
              ),
              serviceImplName,
              classParam
            );
            genMapper(
              path.resolve(
                packagePath,
                mapperPackageName && mapperPackageName.replaceAll(".", "/")
              ),
              mapperName,
              classParam
            );
          });
          vscode.window.showInformationMessage("代码生成成功");
          break;
        case "table":
          const tableMeta = node.meta as TableMeta;
          const classBaseName = casePascal(tableMeta.name);
          const controllerName = `${classBaseName}Controller`;
          const serviceInterfaceName = `${classBaseName}Api`;
          const serviceImplName = `${classBaseName}Service`;
          const mapperName = `${classBaseName}Mapper`;
          const classParam: ClassParam = {
            basePackageName,

            domainName: classBaseName,
            domainComment: tableMeta.comment,
            domainPackageName,

            controllerName,
            controllerPackageName,
            controllerPath: `${caseCamel(tableMeta.name)}s`,

            serviceInterfacePackageName,
            serviceInterfaceName,

            serviceImplPackageName,
            serviceImplName,

            mapperPackageName,
            mapperName,

            fields: [],
          };

          const columnItems = await node.getColumnNodes();
          let hasNotNull = false;
          columnItems.forEach((column: any) => {
            const columnMeta = column.column as ColumnMeta;
            if (columnMeta.isNotNull && columnMeta.name !== "id") {
              hasNotNull = true;
            }
            classParam.fields &&
              classParam.fields.push({
                name:
                  caseCamel(columnMeta.name) === "isDeleted"
                    ? "deleted"
                    : caseCamel(columnMeta.name),
                comment: columnMeta.comment,
                type: getJavaFieldType(columnMeta),
                isNotNull: columnMeta.isNotNull,
              });
          });
          classParam.hasNotNull = hasNotNull;

          genDomain(
            path.resolve(
              packagePath,
              domainPackageName && domainPackageName.replaceAll(".", "/")
            ),
            classBaseName,
            classParam
          );
          genController(
            path.resolve(
              packagePath,
              controllerPackageName &&
                controllerPackageName.replaceAll(".", "/")
            ),
            controllerName,
            classParam
          );
          genServiceInterface(
            path.resolve(
              packagePath,
              serviceInterfacePackageName &&
                serviceInterfacePackageName.replaceAll(".", "/")
            ),
            serviceInterfaceName,
            classParam
          );
          genServiceImpl(
            path.resolve(
              packagePath,
              serviceImplPackageName &&
                serviceImplPackageName.replaceAll(".", "/")
            ),
            serviceImplName,
            classParam
          );
          genMapper(
            path.resolve(
              packagePath,
              mapperPackageName && mapperPackageName.replaceAll(".", "/")
            ),
            mapperName,
            classParam
          );
          vscode.window.showInformationMessage("代码生成成功");
          break;
      }
    }
  );
  context.subscriptions.push(genAllCode);
  const jumpToSetting = (setting: string, message: string) => {
    vscode.window.showInformationMessage(message, "配置").then((choice) => {
      if (choice === "配置") {
        vscode.commands.executeCommand(
          "workbench.action.openSettings",
          setting
        );
      }
    });
  };
}

// This method is called when your extension is deactivated
export function deactivate() {}
