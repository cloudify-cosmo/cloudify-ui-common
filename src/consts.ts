export type NodeStatus = typeof nodeStatuses[keyof typeof nodeStatuses];

/**
 * Node statuses constants.
 *
 * @enum {string}
 */
export const nodeStatuses = {
    UNINITIALIZED: 'uninitialized',
    LOADING: 'loading',
    DONE: 'done',
    ALERT: 'alert',
    FAILED: 'failed'
} as const;

export default { nodeStatuses };
