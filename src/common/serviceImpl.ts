import Handlebars from "handlebars";

const serviceImplTemplate = `package {{basePackageName}}{{#if serviceImplPackageName}}.{{serviceImplPackageName}}{{/if}};

import org.springframework.stereotype.Service;

import {{basePackageName}}{{#if serviceInterfacePackageName}}.{{serviceInterfacePackageName}}{{/if}}.{{serviceInterfaceName}};
import {{basePackageName}}{{#if mapperPackageName}}.{{mapperPackageName}}{{/if}}.{{mapperName}};
import {{basePackageName}}{{#if domainPackageName}}.{{domainPackageName}}{{/if}}.{{domainName}};
import com.mybatisflex.spring.service.impl.ServiceImpl; 

{{#if domainComment}}
/**
 * {{domainComment}} service 实现
 */
{{/if}}
@Service
public class {{serviceImplName}} extends ServiceImpl<{{mapperName}}, {{domainName}}> implements {{serviceInterfaceName}} {

}`;
const serviceImplCompile = Handlebars.compile(serviceImplTemplate);
export default serviceImplCompile;
