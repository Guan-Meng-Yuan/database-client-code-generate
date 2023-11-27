import Handlebars from "handlebars";

const domainTemplate = `package {{basePackageName}}{{#if domainPackageName}}.{{domainPackageName}}{{/if}};

import com.guanmengyuan.spring.ex.common.model.domain.BaseDomain;
{{#if hasNotNull}}
import com.guanmengyuan.spring.ex.common.model.valid.group.SaveGroup;
import com.guanmengyuan.spring.ex.common.model.valid.group.UpdateGroup;
{{/if}}

{{#if hasNotNull}}
import jakarta.validation.constraints.NotNull;
{{/if}}
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

{{#each importPackages}}
{{this}}
{{/each}}

{{#if domainComment}}
/**
 * {{domainComment}}
 */
{{/if}}
@Accessors(chain = true)
@Data(staticConstructor = "create")
@EqualsAndHashCode(callSuper = true)
public class {{domainName}} extends BaseDomain<{{domainName}}> {

{{#each fields}}
  {{#if comment}}
    /**
     * {{comment}}
     */
  {{/if}}
  {{#if isNotNull}}
    @NotNull(groups = { SaveGroup.class, UpdateGroup.class },message = "{{comment}}不能为空")
  {{/if}}
    private {{type}} {{name}};

{{/each}}
}`;
const domainCompile = Handlebars.compile(domainTemplate);
export default domainCompile;
