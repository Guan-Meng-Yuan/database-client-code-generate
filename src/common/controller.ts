import Handlebars from "handlebars";

const controllerTemplate = `package {{basePackageName}}{{#if controllerPackageName}}.{{controllerPackageName}}{{/if}};

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import {{basePackageName}}{{#if serviceInterfacePackageName}}.{{serviceInterfacePackageName}}{{/if}}.{{serviceInterfaceName}};
import {{basePackageName}}{{#if domainPackageName}}.{{domainPackageName}}{{/if}}.{{domainName}};
import com.guanmengyuan.spring.ex.web.controller.BaseController;

import lombok.RequiredArgsConstructor;

{{#if domainComment}}
/**
 * {{domainComment}}接口
 */
{{/if}}
@RestController
@RequestMapping("{{controllerPath}}")
@RequiredArgsConstructor
public class {{controllerName}} extends BaseController<{{serviceInterfaceName}}, {{domainName}}> {

}`;
const controllerCompile = Handlebars.compile(controllerTemplate);
export default controllerCompile;
