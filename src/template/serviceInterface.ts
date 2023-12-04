import Handlebars from "handlebars";

const javaApiTemplate = `package {{javaRootPackage}}{{#if javaServiceInterfacePackage}}.{{javaServiceInterfacePackage}}{{/if}};
{{#if iServiceName}}
{{#if javaIServicePackage}}

import {{javaRootPackage}}{{#if javaDomainPackage}}.{{javaDomainPackage}}{{/if}}.{{className}};
import {{javaIServicePackage}}.{{iServiceNameNoGeneric}};
{{/if}}
{{/if}}

{{#if classComment}}
/**
 * {{classComment}} service 接口
 */
{{/if}}
public interface {{serviceInterfaceName}} {{#if iServiceName}}{{#if javaIServicePackage}}extends {{{iServiceName}}}{{/if}}{{/if}} {

}`;
const serviceInterfaceCompile = Handlebars.compile(javaApiTemplate);
export default serviceInterfaceCompile;
