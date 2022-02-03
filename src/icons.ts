import { nodeStatuses } from './consts';

/**
 * Get node type icon character to be used with cloudify font.
 *
 * @param {string|string[]} hierarchy - node type hierarchy, from the most specific to the most generic,
 * can be single string (eg. "cloudify.nodes.Root")
 * or array of strings (eg. ["cloudify.nodes.CloudifyManager", "cloudify.nodes.SoftwareComponent", "cloudify.nodes.Root"]).
 *
 * @returns {string} character from cloudify font
 */
export function getNodeIcon(hierarchy: string | string[]) {
    const nodeTypeToChar = {
        'cloudify.nodes.ApplicationModule': '\ue616',
        'cloudify.nodes.ApplicationServer': '\ue61e',
        'cloudify.nodes.Compute': '\ue61b',
        'cloudify.nodes.Database': '\ue619',
        'cloudify.nodes.DBMS': '\ue619',
        'cloudify.nodes.FileSystem': '\ue625',
        'cloudify.nodes.LoadBalancer': '\ue617',
        'cloudify.nodes.MessageBusServer': '\ue61c',
        'cloudify.nodes.Network': '\ue62f',
        'cloudify.nodes.ObjectStorage': '\ue627',
        'cloudify.nodes.Port': '\ue61a',
        'cloudify.nodes.Root': '\ue616',
        'cloudify.nodes.Router': '\ue618',
        'cloudify.nodes.SecurityGroup': '\ue61f',
        'cloudify.nodes.SoftwareComponent': '\ue61e',
        'cloudify.nodes.Subnet': '\ue61d',
        'cloudify.nodes.Tier': '\ue621',
        'cloudify.nodes.VirtualIP': '\ue61a',
        'cloudify.nodes.Volume': '\ue620',
        'cloudify.nodes.WebServer': '\ue622',
        'cloudify.nodes.Component': '\ue631',
        'cloudify.nodes.SharedResource': '\ue632'
    };
    const defaultNodeType = 'cloudify.nodes.ApplicationModule';

    const typeHierarchy = Array.isArray(hierarchy) ? hierarchy : [hierarchy || ''];
    const knownType = typeHierarchy.find(type => !!nodeTypeToChar[type]);

    return knownType ? nodeTypeToChar[knownType] : nodeTypeToChar[defaultNodeType];
}

/**
 * Get node status icon character to be used with cloudify font.
 *
 * @param {nodeStatuses} nodeStatus - node status value.
 *
 * @returns {string} character from cloudify font or empty string for not {@link nodeStatuses} value
 */
export function getNodeStatusIcon(nodeStatus) {
    const nodeStatusToChar = {
        [nodeStatuses.ALERT]: '\ue629',
        [nodeStatuses.DONE]: '\ue62a',
        [nodeStatuses.FAILED]: '\ue62b',
        [nodeStatuses.LOADING]: '\ue630'
    };
    const defaultChar = '';
    const knownType = !!nodeStatusToChar[nodeStatus];

    return knownType ? nodeStatusToChar[nodeStatus] : defaultChar;
}

/**
 * Get event type icon character to be used with cloudify font.
 *
 * @param {string} eventType - event type, eg. "workflow_started" or "task_received".
 *
 * @returns {string} character from cloudify font
 */
export function getEventIcon(eventType) {
    const eventTypeToChar = {
        policy_failed: '\ue605',
        policy_success: '\ue606',
        sending_task: '\ue62c',
        task_failed: '\ue608',
        task_received: '\ue609',
        task_rescheduled: '\ue613',
        task_retried: '\ue604',
        task_started: '\ue62d',
        task_succeeded: '\ue60b',
        workflow_cancelled: '\ue600',
        workflow_failed: '\ue601',
        workflow_initializing_node: '\ue60c',
        workflow_initializing_policies: '\ue60c',
        workflow_received: '\ue60c',
        workflow_stage: '\ue60c',
        workflow_started: '\ue602',
        workflow_succeeded: '\ue603'
    };
    const defaultChar = '\ue60a';
    const knownType = !!eventTypeToChar[eventType];

    return knownType ? eventTypeToChar[eventType] : defaultChar;
}

export default {
    getEventIcon,
    getNodeIcon,
    getNodeStatusIcon
};
