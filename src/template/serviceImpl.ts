import Handlebars from "handlebars";

const serviceImplTemplate = `package {{javaRootPackage}}{{#if javaServiceImplPackage}}.{{javaServiceImplPackage}}{{/if}};

import org.springframework.stereotype.Service;

import {{javaRootPackage}}{{#if javaServiceInterfacePackage}}.{{javaServiceInterfacePackage}}{{/if}}.{{serviceInterfaceName}};
{{#if baseServiceImplName}}
{{#if javaBaseServiceImplPackage}}
import {{javaRootPackage}}{{#if javaMapperPackage}}.{{javaMapperPackage}}{{/if}}.{{mapperName}};
import {{javaRootPackage}}{{#if javaDomainPackage}}.{{javaDomainPackage}}{{/if}}.{{className}};
import {{javaBaseServiceImplPackage}}.{{baseServiceImplNameNoGeneric}}; 
{{/if}}
{{/if}}

{{#if classComment}}
/**
 * {{classComment}} service 实现
 */
{{/if}}
@Service
public class {{serviceImplName}}{{#if baseServiceImplName}}{{#if javaBaseServiceImplPackage}} extends {{{baseServiceImplName}}}{{/if}}{{/if}} implements {{serviceInterfaceName}} {

}`;
const serviceImplCompile = Handlebars.compile(serviceImplTemplate);
export default serviceImplCompile;
