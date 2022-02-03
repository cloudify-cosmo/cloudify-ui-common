export type NodeStatusValue = 'uninitialized' | 'loading' | 'done' | 'alert' | 'failed';
export type NodeStatuses = Record<string, NodeStatusValue>;

/**
 * Node statuses constants.
 *
 * @enum {string}
 */
export const nodeStatuses: NodeStatuses = {
    UNINITIALIZED: 'uninitialized',
    LOADING: 'loading',
    DONE: 'done',
    ALERT: 'alert',
    FAILED: 'failed'
};

export default { nodeStatuses };
