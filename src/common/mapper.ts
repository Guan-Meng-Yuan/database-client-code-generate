import Handlebars from "handlebars";

const mapperTemplate = `package {{basePackageName}}{{#if mapperPackageName}}.{{mapperPackageName}}{{/if}};

import {{basePackageName}}{{#if domainPackageName}}.{{domainPackageName}}{{/if}}.{{domainName}};
import com.mybatisflex.core.BaseMapper;

{{#if domainComment}}
/**
 * {{domainComment}} dao 接口
 */
{{/if}}
public interface {{mapperName}} extends BaseMapper<{{domainName}}> {

}`;
const mapperCompile = Handlebars.compile(mapperTemplate);
export default mapperCompile;
