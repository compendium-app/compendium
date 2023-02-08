/// <reference types="react" />
interface NodeDetailDrawerProps {
    nodeId: string;
    onClose: () => void;
    onNodeSelected: (id: string) => void;
}
export declare const NodeDetailDrawer: ({ nodeId, onClose, onNodeSelected, }: NodeDetailDrawerProps) => JSX.Element;
export {};
