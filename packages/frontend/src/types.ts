/**
 * Get type name of provided variable.
 *
 * @param {any} value any variable
 * @returns {string} variable type name
 */
export function toType(value: any): string {
    return {}.toString
        .call(value)
        .match(/\s([a-zA-Z]+)/)![1]
        .toLowerCase();
}

/**
 * Get type, used in Cloudify core, of provided variable.
 *
 * @param {any} value any variable
 * @returns {string} variable Cloudify type name
 */
export function toCloudifyType(value: any): string | undefined {
    const type = toType(value);

    switch (type) {
        case 'boolean':
        case 'string':
            return type;
        case 'number':
            return Number.isInteger(value) ? 'integer' : 'float';
        case 'array':
            return 'list';
        case 'object':
            return 'dict';
        default:
            return undefined;
    }
}

/**
 * Get string value of provided variable.
 *
 * @param {any} value - any type variable
 * @returns {string} stringified value of provided variable
 */
export function getStringValue(value: any): string {
    let stringValue = null;

    switch (toType(value)) {
        case 'array':
        case 'object':
            stringValue = JSON.stringify(value);
            break;
        case 'boolean':
        case 'string':
        case 'number':
        default:
            stringValue = String(value);
            break;
    }

    return stringValue;
}

/**
 * Get typed value of provided string variable.
 *
 * @param {string} value - any string value
 * @returns {any} typed value of provided string
 */
export function getTypedValue(value: string): any {
    const initialType = toType(value);

    if (initialType === 'string') {
        // Null or Undefined
        if (value === 'null') {
            return null;
        }
        if (value === 'undefined') {
            return undefined;
        }

        // Boolean
        if (value === 'true') {
            return true;
        }
        if (value === 'false') {
            return false;
        }

        // Number
        const numericValue = parseFloat(value);
        if (!Number.isNaN(numericValue)) {
            return numericValue;
        }

        // Object or Array
        let jsonValue = null;
        try {
            jsonValue = JSON.parse(value);
        } catch (e) {
            return value;
        }

        return jsonValue;
    }
    return value;
}

export default {
    toType,
    toCloudifyType,
    getStringValue,
    getTypedValue
};
