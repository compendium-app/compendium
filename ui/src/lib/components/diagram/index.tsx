import { Node } from "../../queries/query-node";
import { useQueryNodes } from "../../queries/query-nodes";
import { DataEdge, DiagramNetwork } from "./network";

interface DiagramProps {
  nodeIds: string[];
  selectedNodeId?: string;
  nodeSelected?: (node: string, shift: boolean) => void;
}

export const Diagram = (props: DiagramProps) => {
  const { nodeIds, selectedNodeId, nodeSelected } = props;
  const { data } = useQueryNodes({ ids: nodeIds });

  const nodes = {} as { [key: string]: Node };
  const edges = {} as { [key: string]: DataEdge };
  if (data) {
    for (const node of data) {
      if (!node) {
        continue;
      }
      nodes[node.id] = node;

      for (const d of node.dependencies) {
        if (!d.node) continue;
        const dn = d.node;
        const from = node.id;
        const to = dn.id;
        const id = `${from}_${to}`;
        edges[id] = { from, to, id, length: 200, dashed: false };
        nodes[dn.id] = dn;
      }
      for (const d of node.dependants) {
        if (!d.node) continue;
        const dn = d.node;

        const to = node.id;
        const from = dn.id;
        const id = `${from}_${to}`;
        edges[id] = {
          from,
          to,
          id,
          length: 200,
          dashed: false, //d.dependantVersion !== dn.version,
        };
        nodes[dn.id] = dn;
      }
    }
  }
  const graph = { nodes, edges };

  return (
    <>
      {/* {JSON.stringify(graph, null, "")} */}
      {/* {JSON.stringify(data, null, "")} */}

      <DiagramNetwork
        selectedNodeIds={selectedNodeId ? [selectedNodeId] : []}
        visibleNodeIds={nodeIds}
        // selectedNodeIds={[]}
        // visibleNodeIds={[]}
        graph={graph}
        nodeSelected={(node, shift) => {
          // setNode(node);
          if (nodeSelected) {
            nodeSelected(node, shift);
          }
        }}
      />
    </>
  );
};
