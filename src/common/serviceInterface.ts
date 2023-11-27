import Handlebars from "handlebars";

const javaApiTemplate = `package {{basePackageName}}{{#if serviceInterfacePackageName}}.{{serviceInterfacePackageName}}{{/if}};

import {{basePackageName}}{{#if domainPackageName}}.{{domainPackageName}}{{/if}}.{{domainName}};
import com.mybatisflex.core.service.IService;

{{#if domainComment}}
/**
 * {{domainComment}} service 接口
 */
{{/if}}
public interface {{serviceInterfaceName}} extends IService<{{domainName}}> {

}`;
const serviceInterfaceCompile = Handlebars.compile(javaApiTemplate);
export default serviceInterfaceCompile;
