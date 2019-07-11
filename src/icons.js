/**
 * @param hierarchy - string or array containing node type hierarchy, from the most specific to the most generic
 *
 * @return character from gigaspaces font
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
        'cloudify.nodes.ObjectStorage': '\ue625',
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
