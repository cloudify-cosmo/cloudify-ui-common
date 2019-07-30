import consts from '../src/consts';

describe('nodeStatuses', () => {
    test('getting alert state', () => {
        expect(consts.nodeStatuses.ALERT).toBe('alert');
    });

    test('getting done state', () => {
        expect(consts.nodeStatuses.DONE).toBe('done');
    });

    test('getting failed state', () => {
        expect(consts.nodeStatuses.FAILED).toBe('failed');
    });

    test('getting loading state', () => {
        expect(consts.nodeStatuses.LOADING).toBe('loading');
    });
});
