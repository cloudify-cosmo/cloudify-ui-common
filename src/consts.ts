export type NodeStatus = 'uninitialized' | 'loading' | 'done' | 'alert' | 'failed';
type NodeStatuses = Record<string, NodeStatus>;

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
