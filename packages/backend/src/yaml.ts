import { isArray, isEmpty, isObject, isString, mapValues, omitBy } from 'lodash';
import yaml from 'js-yaml';
import type { Blueprint } from './types';

class IntrinsicFunction {
    // eslint-disable-next-line no-useless-constructor
    constructor(public functionObject: Record<string, any>) {}
}

const intrinsicFunctionYamlType = new yaml.Type('!format', {
    kind: 'mapping',
    resolve: () => false,
    instanceOf: IntrinsicFunction,
    represent: intrinsicFunction =>
        `{ ${yaml.dump((<IntrinsicFunction>intrinsicFunction).functionObject, { flowLevel: 1 }).trim()} }`
});

const schema = yaml.DEFAULT_SCHEMA.extend({ implicit: [intrinsicFunctionYamlType] });
const lineWidth = 120;

function prepareIntrinsicFunctions(obj: Record<string, any>) {
    mapValues(obj, (value, key) => {
        const isIntrinsicFunctionObject =
            value &&
            Object.keys(value).length === 1 &&
            (isString(value.get_input) ||
                isString(value.get_secret) ||
                isArray(value.get_attribute) ||
                isArray(value.get_property) ||
                isArray(value.get_sys) ||
                isString(value.get_environment_capability) ||
                isArray(value.get_capability) ||
                isArray(value.concat));
        if (isIntrinsicFunctionObject) {
            obj[key] = new IntrinsicFunction(value);
        } else if (isObject(value)) {
            prepareIntrinsicFunctions(value);
        }
    });
}

export const renderBlueprintYaml = (blueprint: Blueprint) => {
    prepareIntrinsicFunctions(blueprint);
    // Omit values that are object (object or array, not a simple type) and are empty, or are just null
    const result = omitBy(blueprint, member => member === null || (isObject(member) && isEmpty(member)));
    return renderYaml(result);
};

export const renderYaml = (source: any) => {
    return yaml.dump(source, { lineWidth, schema });
};
