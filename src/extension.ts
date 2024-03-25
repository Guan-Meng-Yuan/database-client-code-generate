import * as vscode from "vscode";
import * as fs from "fs-extra";
import path = require("path");
import { caseCamel, casePascal, caseSnake } from "@zerodep/case";
import { Field, Config, TableMeta, Node } from "types/model";
import controllerCompile from "./template/controller";
import domainCompile from "./template/domain";
import serviceInterfaceCompile from "./template/serviceInterface";
import serviceImplCompile from "./template/serviceImpl";
import mapperCompile from "./template/mapper";
import { ModelType } from "./enums";

export function activate(context: vscode.ExtensionContext) {
  let genAllCode = vscode.commands.registerCommand(
    "database-client-code-generate.code-gen-java",
    async (node: Node) => {
      const workspace = vscode.workspace.workspaceFolders;
      const workspacePath = workspace && workspace[0].uri.fsPath;
      if (!workspacePath) {
        vscode.window.showErrorMessage("请先选择项目目录");
        return;
      }
      const config = getConfig();
      if (!config.javaRootPackage) {
        jumpToSetting(
          "database-client-code-generate.javaRootPackage",
          "请先配置Java项目基础包名"
        );
        return;
      }
      switch (node.contextValue) {
        case ModelType.SCHEMA:
          genAllTable(node, config, workspacePath);
          break;
        case ModelType.TABLE:
          const tableMeta = node as unknown as TableMeta;
          genOneTable(tableMeta, config, workspacePath);
      }

      vscode.window.showInformationMessage("Java代码生成成功!");
    }
  );
  context.subscriptions.push(genAllCode);
}
const genOneTable = async (
  tableMeta: TableMeta,
  config: Config,
  workspacePath: string
) => {
  const tableName = tableMeta.label;
  const importPackages = new Set<string>();
  let hasNotNull = false;
  let hasPrimary = false;
  // 获取列
  const fields: Field[] = (await tableMeta.getColumnNodes())
    .map(({ column }) => {
      const startsWithAny = (str: string, prefixes: string[] = []) =>
        prefixes.some((prefix) => str.startsWith(prefix));
      if (
        config.removeColumnPrefix?.length &&
        startsWithAny(column.name, config.removeColumnPrefix)
      ) {
        column.name = caseSnake(
          config.removeColumnPrefix.reduce(
            (result, prefix) => result.replace(prefix, ""),
            column.name
          )
        );
      }
      return column;
    })
    .filter(({ name }) => {
      if (config.javaSupperDomainName && config.javaSupperDomainClassPackage) {
        return !config.javaSupperDomainClassField?.includes(caseCamel(name));
      }
      return true;
    })
    .map((x) => {
      if (x.isNotNull) {
        hasNotNull = x.isNotNull;
      }
      if (x.isPrimary) {
        hasPrimary = x.isPrimary;
      }

      return {
        name: caseCamel(x.name),
        type: getClassType(x.simpleType, x.type, importPackages),
        comment: x.comment,
        isNotNull: x.isNotNull,
        isPrimary: x.isPrimary,
      };
    });
  const className = casePascal(tableName);
  const classParam = {
    ...config,
    fields,
    className,
    supperClassName: getSuperClassName(config, className),
    supperClassNameNoGeneric: getSuperClassNameNoGeneric(config),
    hasNotNull,
    hasPrimary,
    classComment: tableMeta.comment,
    controllerName: `${className}${config.javaControllerSuffix}`,
    iServiceName: getSupperInterfaceName(config, className),
    iServiceNameNoGeneric: getSupperInterfaceNameNoGeneric(config),
    serviceInterfaceName: `${className}${config.javaServiceInterfaceSuffix}`,
    baseServiceImplName: getBaseServiceImplName(
      config,
      className,
      `${className}${config.javaMapperSuffix}`
    ),
    baseServiceImplNameNoGeneric: getBaseServiceImplNameNoGeneric(config),
    serviceImplName: `${className}${config.javaServiceImplSuffix}`,
    mapperName: `${className}${config.javaMapperSuffix}`,
    baseMapperName: getBaseMapperName(config, className),
    baseMapperNameNoGeneric: getBaseMapperNameNoGeneric(config),
    controllerPath: `${caseCamel(className)}s`,
    baseControllerName: getBaseController(
      config,
      className,
      `${className}${config.javaServiceInterfaceSuffix}`
    ),
    baseControllerNameNoGeneric: getBaseControllerNoGeneric(config),
    importPackages,
  };
  //生成controller
  const controllerContent = controllerCompile(classParam);
  genClass(
    workspacePath,
    controllerContent,
    classParam.controllerName,
    `${config.javaRootPackage}.${config.javaControllerPackage}`
  );
  const domainContent = domainCompile(classParam);
  genClass(
    workspacePath,
    domainContent,
    classParam.className,
    `${config.javaRootPackage}.${config.javaDomainPackage}`
  );
  const serviceInterfaceContent = serviceInterfaceCompile(classParam);
  genClass(
    workspacePath,
    serviceInterfaceContent,
    classParam.serviceInterfaceName,
    `${config.javaRootPackage}.${config.javaServiceInterfacePackage}`
  );
  const serviceImplContent = serviceImplCompile(classParam);
  genClass(
    workspacePath,
    serviceImplContent,
    classParam.serviceImplName,
    `${config.javaRootPackage}.${config.javaServiceImplPackage}`
  );
  const mapperContent = mapperCompile(classParam);
  genClass(
    workspacePath,
    mapperContent,
    classParam.mapperName,
    `${config.javaRootPackage}.${config.javaMapperPackage}`
  );
};
const genAllTable = async (
  node: Node,
  config: Config,
  workspacePath: string
) => {
  const tables = await getTables(node);
  if (tables && tables.length > 0) {
    for (const table of tables) {
      const tableMeta = table as unknown as TableMeta;
      genOneTable(tableMeta, config, workspacePath);
    }
  }
};

const getBaseMapperName = (config: Config, className: String) => {
  if (config.javaBaseMapperName && config.javaBaseMapperPackage) {
    let match = config.javaBaseMapperName.match(/<([^>]+)>/);
    if (match && match[1] === "T") {
      return `${config.javaBaseMapperName.substring(
        0,
        match.index
      )}<${className}>`;
    }
    return config.javaBaseMapperName;
  }
};
const jumpToSetting = (setting: string, message: string) => {
  vscode.window.showErrorMessage(message, "配置").then((choice) => {
    if (choice === "配置") {
      vscode.commands.executeCommand("workbench.action.openSettings", setting);
    }
  });
};
const getBaseMapperNameNoGeneric = (config: Config) => {
  return config.javaBaseMapperName?.substring(
    0,
    config.javaBaseMapperName.match(/<([^,>]+)(?:,\s*([^>]+))?>/)?.index
  );
};
const getBaseServiceImplNameNoGeneric = (config: Config) => {
  return config.javaBaseServiceImplName?.substring(
    0,
    config.javaBaseServiceImplName.match(/<([^,>]+)(?:,\s*([^>]+))?>/)?.index
  );
};
const getBaseServiceImplName = (
  config: Config,
  className: String,
  mapperName: string
) => {
  if (config.javaBaseServiceImplName && config.javaBaseServiceImplPackage) {
    let match = config.javaBaseServiceImplName.match(
      /<([^,>]+)(?:,\s*([^>]+))?>/
    );
    if (match && match[1] === "M" && match[2] === "T") {
      return `${config.javaBaseServiceImplName.substring(
        0,
        match.index
      )}<${mapperName}, ${className}>`;
    } else if (match && match[1] === "M" && match[2] === undefined) {
      return `${config.javaBaseServiceImplName.substring(
        0,
        match.index
      )}<${mapperName}>`;
    } else if (match && match[1] === "T" && match[2] === undefined) {
      return `${config.javaBaseServiceImplName.substring(
        0,
        match.index
      )}<${className}>`;
    } else {
      return config.javaBaseServiceImplName;
    }
  }
};
const getBaseControllerNoGeneric = (config: Config) => {
  return config.javaBaseControllerName?.substring(
    0,
    config.javaBaseControllerName.match(/<([^,>]+)(?:,\s*([^>]+))?>/)?.index
  );
};
const getBaseController = (
  config: Config,
  className: String,
  serviceInterfaceName: string
) => {
  if (config.javaBaseControllerName && config.javaBaseControllerPackage) {
    let match = config.javaBaseControllerName.match(
      /<([^,>]+)(?:,\s*([^>]+))?>/
    );
    if (match && match[1] === "S" && match[2] === "T") {
      return `${config.javaBaseControllerName.substring(
        0,
        match.index
      )}<${serviceInterfaceName}, ${className}>`;
    } else if (match && match[1] === "S" && match[2] === undefined) {
      return `${config.javaBaseControllerName.substring(
        0,
        match.index
      )}<${serviceInterfaceName}>`;
    } else if (match && match[1] === "T" && match[2] === undefined) {
      return `${config.javaBaseControllerName.substring(
        0,
        match.index
      )}<${className}>`;
    } else {
      return config.javaBaseControllerName;
    }
  }
};
const getSupperInterfaceNameNoGeneric = (config: Config) => {
  return config.javaIServiceName?.substring(
    0,
    config.javaIServiceName.match(/<([^>]+)>/)?.index
  );
};
const getSupperInterfaceName = (config: Config, className: string) => {
  if (config.javaIServiceName && config.javaIServicePackage) {
    let match = config.javaIServiceName.match(/<([^>]+)>/);
    if (match && match[1] === "T") {
      return `${config.javaIServiceName.substring(
        0,
        match.index
      )}<${className}>`;
    }
    return config.javaSupperDomainName;
  }
};
const getSuperClassNameNoGeneric = (config: Config) => {
  return config.javaSupperDomainName?.substring(
    0,
    config.javaSupperDomainName.match(/<([^>]+)>/)?.index
  );
};
const getSuperClassName = (config: Config, className: string) => {
  if (config.javaSupperDomainName && config.javaSupperDomainClassPackage) {
    let match = config.javaSupperDomainName.match(/<([^>]+)>/);
    if (match && match[1] === "T") {
      return `${config.javaSupperDomainName.substring(
        0,
        match.index
      )}<${className}>`;
    }
    return config.javaSupperDomainName;
  }
};

/**
 * 获取所有表信息
 * @param node
 */
const getTables = async (node: Node): Promise<Node[] | undefined> => {
  const children = await node.getChildren();
  const tableItem = children?.find((item) => item.label === "Tables");
  if (tableItem) {
    return (await tableItem.getChildren()) || undefined;
  }
  for (const nodeItem of children || []) {
    const result = await getTables(nodeItem);
    if (result) {
      return result; // 返回找到的结果，终止递归
    }
  }
};
/**
 * 获取配置信息
 */
const getConfig = () => {
  const config = vscode.workspace.getConfiguration(
    "database-client-code-generate"
  ) as Config;
  return config;
};
const getClassType = (
  simpleType: string,
  columnType: string,
  importPackages: Set<string>
) => {
  if (
    simpleType === "varchar" ||
    simpleType === "json" ||
    simpleType === "jsonb" ||
    simpleType === "longtext" ||
    simpleType === "mediumtext" ||
    simpleType === "text" ||
    simpleType === "tinytext" ||
    simpleType === "uuid"
  ) {
    return "String";
  }
  if (simpleType === "bigint") {
    return "Long";
  }
  if (simpleType === "char") {
    return "Character";
  }
  if (simpleType === "date") {
    importPackages.add("import java.time.LocalDate;");
    return "LocalDate";
  }
  if (simpleType === "datetime") {
    importPackages.add("import java.util.Date;");
    return "Date";
  }
  if (
    simpleType === "decimal" ||
    simpleType === "numeric" ||
    simpleType === "real"
  ) {
    importPackages.add("import java.math.BigDecimal;");
    return "BigDecimal";
  }
  if (simpleType === "double") {
    return "Double";
  }
  if (simpleType.startsWith("float")) {
    return "Float";
  }
  if (
    simpleType === "integer" ||
    simpleType === "mediumint" ||
    simpleType === "smallint" ||
    (simpleType.startsWith("int") && simpleType !== "interval")
  ) {
    return "Integer";
  }
  if (simpleType === "time") {
    importPackages.add("import java.time.LocalTime;");
    return "LocalTime";
  }
  if (simpleType === "timetz") {
    importPackages.add("import java.time.LocalTime;");
    return "LocalTime";
  }
  if (simpleType === "timestamp") {
    importPackages.add("import java.sql.Timestamp;");
    return "Timestamp";
  }
  if (simpleType === "timestamptz") {
    importPackages.add("import java.sql.Timestamp;");
    return "Timestamp";
  }
  if (simpleType === "tinyint") {
    if (columnType === "tinyint(1)") {
      return "Boolean";
    }
    return "Integer";
  }
  if (simpleType === "bool" || simpleType === "boolean") {
    return "Boolean";
  }
  if (simpleType === "year") {
    importPackages.add("import java.time.Year;");
    return "Year";
  }

  return "Object";
};
const genClass = (
  workspacePath: string,
  content: string,
  className: string,
  packagePath?: string
) => {
  const fullPath = path.resolve(
    workspacePath,
    Path.JAVA_PATH,
    packagePath ? packagePath.replaceAll(".", "/") : ""
  );
  fs.ensureDirSync(fullPath);
  const classPath = path.resolve(fullPath, `${className}.java`);
  fs.writeFile(classPath, content, { flag: "w", encoding: "utf-8" });
};
enum Path {
  JAVA_PATH = "src/main/java",
}
enum DatabaseType {
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
// This method is called when your extension is deactivated
export function deactivate() {}
