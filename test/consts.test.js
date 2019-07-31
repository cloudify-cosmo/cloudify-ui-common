import { nodeStatuses } from '../src/consts';

describe('nodeStatuses', () => {
    test('getting alert state', () => {
        expect(nodeStatuses.ALERT).toBe('alert');
    });

    test('getting done state', () => {
        expect(nodeStatuses.DONE).toBe('done');
    });

    test('getting failed state', () => {
        expect(nodeStatuses.FAILED).toBe('failed');
    });

    test('getting loading state', () => {
        expect(nodeStatuses.LOADING).toBe('loading');
    });
});
