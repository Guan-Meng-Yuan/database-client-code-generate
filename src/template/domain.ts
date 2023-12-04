import Handlebars from "handlebars";

const domainTemplate = `package {{javaRootPackage}}{{#if javaDomainPackage}}.{{javaDomainPackage}}{{/if}};

{{#each importPackages}}
{{this}}
{{/each}}
{{#if javaSupperDomainClassPackage}}
{{#if supperClassName}}

import {{javaSupperDomainClassPackage}}.{{supperClassNameNoGeneric}};
{{/if}}
{{/if}}
{{#if hasNotNull}}

import com.guanmengyuan.spring.ex.common.model.valid.group.SaveGroup;
import com.guanmengyuan.spring.ex.common.model.valid.group.UpdateGroup;
{{#if hasPrimary}}
//TODO 请替换为自己的id注解,默认为mybatisflex注解
import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.KeyType;
import com.mybatisflex.core.keygen.KeyGenerators;
{{/if}}

import jakarta.validation.constraints.NotNull;
{{/if}}
import lombok.Data;
{{#if javaSupperDomainClassPackage}}
{{#if supperClassName}}
import lombok.EqualsAndHashCode;
{{/if}}
{{/if}}
import lombok.experimental.Accessors;

{{#if classComment}}
/**
 * {{classComment}}
 */
{{/if}}
@Accessors(chain = true)
@Data(staticConstructor = "create")
{{#if javaSupperDomainClassPackage}}
{{#if supperClassName}}
@EqualsAndHashCode(callSuper = true)
{{/if}}
{{/if}}
public class {{className}} {{#if javaSupperDomainClassPackage}}{{#if supperClassName}}extends {{{supperClassName}}}{{/if}}{{/if}} {

{{#each fields}}
  {{#if comment}}
    /**
     * {{comment}}
     */
  {{/if}}
  {{#if isNotNull}}
    @NotNull(groups = { SaveGroup.class, UpdateGroup.class },message = "{{comment}}不能为空")
  {{/if}}
  {{#if isPrimary}}
    @Id(keyType = KeyType.Generator, value = KeyGenerators.snowFlakeId)
  {{/if}}
    private {{type}} {{name}};

{{/each}}
}`;
const domainCompile = Handlebars.compile(domainTemplate);
export default domainCompile;
