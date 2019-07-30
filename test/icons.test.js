import { getEventIcon, getNodeIcon, getNodeStatusIcon } from '../src/icons';

describe('getNodeIcon', () => {
    test('handles empty string', () => {
        expect(getNodeIcon('')).toBe('\ue616');
    });

    test('handles string', () => {
        expect(getNodeIcon('cloudify.nodes.Compute')).toBe('\ue61b');
    });

    test('handles empty array', () => {
        expect(getNodeIcon([])).toBe('\ue616');
    });

    test('handles array', () => {
        expect(getNodeIcon(['cloudify.nodes.Compute', 'cloudify.nodes.Root'])).toBe('\ue61b');
    });

    test('handles invalid input', () => {
        expect(getNodeIcon(555)).toBe('\ue616');
    });
});

describe('getNodeStausIcon', () => {
    test('handles empty string', () => {
        expect(getNodeStatusIcon('')).toBe('');
    });

    test('handles string', () => {
        expect(getNodeStatusIcon('alert')).toBe('\ue629');
    });

    test('handles invalid input', () => {
        expect(getNodeStatusIcon('abcd')).toBe('');
    });
});

describe('getEventIcon', () => {
    test('handles empty string', () => {
        expect(getEventIcon('')).toBe('\ue60a');
    });

    test('handles string', () => {
        expect(getEventIcon('task_succeeded')).toBe('\ue60b');
    });

    test('handles invalid input', () => {
        expect(getEventIcon(555)).toBe('\ue60a');
    });
});
