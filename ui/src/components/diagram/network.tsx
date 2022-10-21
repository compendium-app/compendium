import { useEffect, useRef } from "react";

import { Edge, Network, Node } from "@lifeomic/react-vis-network";
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
  nodes: { [key: string]: DataNode };
  edges: { [key: string]: DataEdge };
}

interface DiagramNetworkProps {
  selectedNodeIds: string[];
  graph: Graph;
  nodeSelected?: (node: string) => void;
}

export const DiagramNetwork = (props: DiagramNetworkProps) => {
  const { graph, nodeSelected, selectedNodeIds } = props;

  const networkRef = useRef();
  useEffect(() => {
    if (networkRef.current) {
      (networkRef.current as any).network.on("click", (event: any) => {
        if (nodeSelected && event.nodes[0]) nodeSelected(event.nodes[0]);
      });
    }
  });
  return (
    <>
      <Network
        ref={networkRef}
        options={{
          width: "100%",
          height: "100%",
          edges: {
            arrows: { to: { enabled: true } },
            smooth: {
              type: "cubicBezier",
              forceDirection: "horizontal",
              // directionInput.value == "UD" || directionInput.value == "DU"
              //   ? "vertical"
              //   : "horizontal",
              roundness: 0.4,
            },
          },
          // nodes: { color: "green" },
          layout: {
            randomSeed: 2000,
            // hierarchical: {
            //   direction: "UD",
            // },
          },
          physics: { enabled: true },
        }}
      >
        {Object.values(graph.nodes).map((n) => {
          const color =
            selectedNodeIds.indexOf(n.id) !== -1 ? "#2B7CE9" : undefined;
          return (
            <Node
              key={`${n.id}_${color}`}
              id={n.id}
              label={n.name}
              color={color}
            />
          );
        })}
        {Object.values(graph.edges).map((e) => (
          <Edge
            key={e.id}
            id={e.id}
            from={e.from}
            to={e.to}
            length={e.length}
            dashes={e.dashed}
          />
        ))}
      </Network>
    </>
  );
};
