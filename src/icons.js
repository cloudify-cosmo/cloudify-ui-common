/**
 * Get node type icon character to be used with cloudify font.
 *
 * @param {string|string[]} hierarchy - node type hierarchy, from the most specific to the most generic,
 * can be single string (eg. "cloudify.nodes.Root")
 * or array of strings (eg. ["cloudify.nodes.CloudifyManager", "cloudify.nodes.SoftwareComponent", "cloudify.nodes.Root"]).
 *
 * @returns {string} character from cloudify font
 */
function getNodeIcon(hierarchy) {
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

export default {
    getNodeIcon
};
