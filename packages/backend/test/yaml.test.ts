import { join } from 'path';
import { readFileSync } from 'fs';
import { renderBlueprintYaml, renderYaml } from '../src/yaml';

describe('yaml', () => {
    it('should convert blueprint model to YAML', () => {
        const blueprintModel = {
            tosca_definitions_version: 'cloudify_dsl_1_3',
            imports: [
                'http://www.getcloudify.org/spec/cloudify/5.1.0.dev1/types.yaml',
                'http://repository.cloudifysource.org/cloudify/wagons/cloudify-openstack-plugin/3.2.16/plugin.yaml',
                'http://repository.cloudifysource.org/artificial-line-extension/artificial-line-extension/cloudify-openstack-plugin/3.2.16/plugin.yaml'
            ],
            inputs: {
                input: {
                    default: { get_secret: 'secretKey' }
                }
            }
        };
        const expectedYaml = readFileSync(join(__dirname, 'fixtures/blueprint.yaml'), { encoding: 'utf8' });
        expect(renderBlueprintYaml(blueprintModel)).toBe(expectedYaml);
    });

    it('should not render empty or null properties on root level', () => {
        const model = {
            a: [],
            b: {},
            c: null,
            d: ''
        };
        expect(renderYaml(model)).toBe("d: ''\n");
    });
});
