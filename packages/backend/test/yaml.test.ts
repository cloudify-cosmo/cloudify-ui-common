import { renderBlueprintYaml } from '../src/yaml';

describe('yaml', () => {
    it('should convert blueprint JSON to YAML (no wraps for lines up to 120 characters)', () => {
        const blueprintExample = {
            tosca_definitions_version: 'cloudify_dsl_1_3',
            imports: [
                'http://www.getcloudify.org/spec/cloudify/5.1.0.dev1/types.yaml',
                'http://repository.cloudifysource.org/cloudify/wagons/cloudify-openstack-plugin/3.2.16/plugin.yaml',
                'http://repository.cloudifysource.org/artificial-line-extension/artificial-line-extension/cloudify-openstack-plugin/3.2.16/plugin.yaml'
            ]
        };
        const expectedYaml =
            'tosca_definitions_version: cloudify_dsl_1_3\n' +
            'imports:\n' +
            '  - http://www.getcloudify.org/spec/cloudify/5.1.0.dev1/types.yaml\n' +
            '  - http://repository.cloudifysource.org/cloudify/wagons/cloudify-openstack-plugin/3.2.16/plugin.yaml\n' +
            '  - >-\n' +
            '    http://repository.cloudifysource.org/artificial-line-extension/artificial-line-extension/cloudify-openstack-plugin/3.2.16/plugin.yaml\n';
        expect(renderBlueprintYaml(blueprintExample)).toBe(expectedYaml);
    });
});
