import { pickTextColorBasedOnBgColor } from "../../helpers/colors.helper";
import {
  getNodeTypesColorMap,
  getUniqueTypes,
} from "../../helpers/node.helper";
import { Node } from "../../queries/query-node";
import { useQueryNodes } from "../../queries/query-nodes";
import { DataEdge, DataNode, DiagramNetwork } from "./network";

interface DiagramProps {
  nodeIds: string[];
  selectedNodeId?: string;
  nodeSelected?: (
    node: string,
    shift: boolean,
    resetVisibleNodes: boolean
  ) => void;
}

export const Diagram = (props: DiagramProps) => {
  const { nodeIds, selectedNodeId, nodeSelected } = props;
  const { data } = useQueryNodes({ ids: nodeIds });

  const allNodes =
    data
      ?.filter((n) => n)
      .flatMap((baseNode) => [
        ...baseNode.dependencies.map((n: any) => n.node),
        ...baseNode.dependants.map((n: any) => n.node),
        baseNode,
      ]) || [];

  const typesColorMap = getNodeTypesColorMap(allNodes);
  const uniqueTypes = getUniqueTypes(allNodes);

  const getNodeProperties = (
    node: Node,
    typesColorMap: Record<string, string>
  ) => {
    const nodeBgColor = typesColorMap[node.type.id];

    const nodeFontColor = nodeBgColor
      ? pickTextColorBasedOnBgColor(nodeBgColor, "#FFFFFF", "#000000")
      : "#FFFFFF";
    const borderWidth = nodeIds.indexOf(node.id) === -1 ? 1 : 3;

    return {
      id: node.id,
      label: node.name,
      color: nodeBgColor,
      font: {
        color: nodeFontColor,
      },
      type: node.type.id,
      borderWidth,
    };
  };

  const nodes = {} as { [key: string]: DataNode };
  const edges = {} as { [key: string]: DataEdge };

  if (data) {
    for (const node of data) {
      if (!node) {
        continue;
      }
      nodes[node.id] = getNodeProperties(node, typesColorMap);

      for (const d of node.dependencies) {
        if (!d.node) continue;
        const dn = d.node;
        const from = node.id;
        const to = dn.id;
        const edgeId = `${from}_${to}`;
        const nodeProperties = getNodeProperties(dn, typesColorMap);
        edges[edgeId] = { from, to, id: edgeId, length: 200, dashes: false };
        nodes[dn.id] = nodeProperties;
      }
      for (const d of node.dependants) {
        if (!d.node) continue;
        const dn = d.node;
        const to = node.id;
        const from = dn.id;
        const edgeId = `${from}_${to}`;
        const nodeProperties = getNodeProperties(dn, typesColorMap);

        edges[edgeId] = {
          from,
          to,
          id: edgeId,
          length: 200,
          dashes: false, //d.dependantVersion !== dn.version,
        };
        nodes[dn.id] = nodeProperties;
      }
    }
  }
  const graph = {
    nodes: Object.values(nodes).map((n) => n),
    edges: Object.values(edges).map((e) => e),
  };

  return (
    <>
      <DiagramNetwork
        selectedNodeIds={selectedNodeId ? [selectedNodeId] : []}
        visibleNodeIds={nodeIds}
        typesColorMap={typesColorMap}
        uniqueTypes={uniqueTypes}
        graph={graph}
        nodeSelected={(node, shift, resetVisibleNodes) => {
          if (nodeSelected) {
            nodeSelected(node, shift, resetVisibleNodes);
          }
        }}
      />
    </>
  );
};
