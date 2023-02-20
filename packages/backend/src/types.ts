export interface BlueprintElement {
    type: string;
    properties?: Record<string, any>;
}

export interface Relationship extends BlueprintElement {
    target: string;
    // eslint-disable-next-line camelcase
    source_interfaces?: Interfaces;
    // eslint-disable-next-line camelcase
    target_interfaces?: Interfaces;
}

export interface Method {
    implementation?: unknown;
    inputs?: Record<string, unknown>;
}

export type Interfaces = Record<string, Record<string, Method>>;

export interface NodeTemplate extends BlueprintElement {
    relationships?: Relationship[];
    interfaces?: Interfaces;
}

export interface NodeType {
    properties: Record<string, { default?: string }>;
}

export interface Group {
    members: string[];
}
export type Groups = Record<string, Group>;

export interface Display {
    rows?: number;
}

export interface Input {
    type?: string;
    constraints?: any[];
    description?: string;
    default?: any;
    required?: boolean;
    hidden?: boolean;
    // eslint-disable-next-line camelcase
    display_label?: string;
    display?: Display;
}

export interface Output {
    description?: string;
    value: any;
}

export interface Label {
    values: string[];
}

export interface Blueprint {
    // eslint-disable-next-line camelcase
    tosca_definitions_version?: string;
    description?: string;
    imports: string[] | null;
    plugins?: Record<string, string>;
    // eslint-disable-next-line camelcase
    node_types?: Record<string, NodeType>;
    // eslint-disable-next-line camelcase
    relationships?: Record<string, { derived_from: string }>;
    inputs?: Record<string, Input>;
    labels?: Record<string, Label>;
    // eslint-disable-next-line camelcase
    blueprint_labels?: Record<string, Label>;
    outputs?: Record<string, Output>;
    capabilities?: Record<string, Output>;
    // eslint-disable-next-line camelcase
    node_templates?: Record<string, NodeTemplate>;
    groups?: Groups;
}
