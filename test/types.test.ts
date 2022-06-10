import { toType, toCloudifyType, getTypedValue, getStringValue } from '../src/types';

describe('types.js', () => {
    it('toType provides correct type of argument', () => {
        expect(toType([])).toEqual('array');
        expect(toType({})).toEqual('object');
        expect(toType(false)).toEqual('boolean');
        expect(toType('test')).toEqual('string');
        expect(toType(6.4)).toEqual('number');
        expect(toType(null)).toEqual('null');
        expect(toType(undefined)).toEqual('undefined');
    });

    it('toCloudifyType provides correct type of argument', () => {
        expect(toCloudifyType([])).toEqual('list');
        expect(toCloudifyType({})).toEqual('dict');
        expect(toCloudifyType(false)).toEqual('boolean');
        expect(toCloudifyType('test')).toEqual('string');
        expect(toCloudifyType(14)).toEqual('integer');
        expect(toCloudifyType(6.4)).toEqual('float');
        expect(toCloudifyType(null)).toEqual(undefined);
        expect(toCloudifyType(undefined)).toEqual(undefined);
    });

    it('getStringValue provides string value of argument', () => {
        expect(getStringValue([])).toEqual('[]');
        expect(getStringValue({})).toEqual('{}');
        expect(getStringValue(false)).toEqual('false');
        expect(getStringValue('test')).toEqual('test');
        expect(getStringValue(6.4)).toEqual('6.4');
        expect(getStringValue(null)).toEqual('null');
        expect(getStringValue(undefined)).toEqual('undefined');
    });

    it('getTypedValue provides typed value of string argument', () => {
        expect(getTypedValue('[]')).toEqual([]);
        expect(getTypedValue('{}')).toEqual({});
        expect(getTypedValue('false')).toEqual(false);
        expect(getTypedValue('true')).toEqual(true);
        expect(getTypedValue('test')).toEqual('test');
        expect(getTypedValue('6.4')).toEqual(6.4);
        expect(getTypedValue('null')).toEqual(null);
        expect(getTypedValue('undefined')).toEqual(undefined);
        expect(getTypedValue([] as unknown as string)).toEqual([]);
    });
});
