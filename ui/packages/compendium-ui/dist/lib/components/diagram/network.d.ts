/// <reference types="react" />
import { Node as DataNode } from "../../queries/query-node";
export interface DataEdge {
    id: string;
    from: string;
    to: string;
    length: number;
    dashed: boolean;
    label?: string;
}
export interface Graph {
    nodes: {
        [key: string]: DataNode;
    };
    edges: {
        [key: string]: DataEdge;
    };
}
interface DiagramNetworkProps {
    selectedNodeIds: string[];
    visibleNodeIds: string[];
    graph: Graph;
    nodeSelected?: (node: string, shift: boolean) => void;
}
export declare const DiagramNetwork: (props: DiagramNetworkProps) => JSX.Element;
export {};
