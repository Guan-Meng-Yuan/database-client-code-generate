import Handlebars from "handlebars";

const mapperTemplate = `package {{javaRootPackage}}{{#if javaMapperPackage}}.{{javaMapperPackage}}{{/if}};
{{#if baseMapperName}}
{{#if javaBaseMapperPackage}}

import {{javaRootPackage}}{{#if javaDomainPackage}}.{{javaDomainPackage}}{{/if}}.{{className}};
import {{javaBaseMapperPackage}}.{{baseMapperNameNoGeneric}};
{{/if}}
{{/if}}

{{#if domainComment}}
/**
 * {{domainComment}} dao 接口
 */
{{/if}}
public interface {{mapperName}} {{#if baseMapperName}}{{#if javaBaseMapperPackage}}extends {{{baseMapperName}}}{{/if}}{{/if}} {

}`;
const mapperCompile = Handlebars.compile(mapperTemplate);
export default mapperCompile;
