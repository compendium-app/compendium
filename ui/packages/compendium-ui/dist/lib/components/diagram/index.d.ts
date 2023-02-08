/// <reference types="react" />
interface DiagramProps {
    nodeIds: string[];
    selectedNodeId?: string;
    nodeSelected?: (node: string, shift: boolean) => void;
}
export declare const Diagram: (props: DiagramProps) => JSX.Element;
export {};
