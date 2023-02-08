export interface Depend {
    dependantVersion: string;
    node: Node;
}
interface NodeMetadata {
    description: string;
}
export interface Node {
    id: string;
    name: string;
    metadata?: NodeMetadata;
    version: string;
    dependencies: Depend[];
    dependants: Depend[];
}
export declare type QueryNodeResult = {
    node?: Node;
};
export declare const metadataFields = "description links { name url }";
export declare const QUERY_NODE: import("@apollo/client").DocumentNode;
export {};
