import Handlebars from "handlebars";

const controllerTemplate = `package {{javaRootPackage}}{{#if javaControllerPackage}}.{{javaControllerPackage}}{{/if}};

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
{{#if javaBaseControllerPackage}}
{{#if baseControllerName}}

import {{javaRootPackage}}{{#if javaServiceInterfacePackage}}.{{javaServiceInterfacePackage}}{{/if}}.{{serviceInterfaceName}};
import {{javaRootPackage}}{{#if javaDomainPackage}}.{{javaDomainPackage}}{{/if}}.{{className}};
import {{javaBaseControllerPackage}}.{{baseControllerNameNoGeneric}};
{{/if}}
{{/if}}

{{#if classComment}}
/**
 * {{classComment}}接口
 */
{{/if}}
@RestController
@RequestMapping("{{controllerPath}}")
public class {{controllerName}} {{#if javaBaseControllerPackage}}{{#if baseControllerName}}extends {{{baseControllerName}}}{{/if}}{{/if}} {

    {{#if javaBaseControllerPackage}}
    public {{controllerName}}({{serviceInterfaceName}} service) {
        super(service);
    }
    {{/if}}
}`;
const controllerCompile = Handlebars.compile(controllerTemplate);
export default controllerCompile;
