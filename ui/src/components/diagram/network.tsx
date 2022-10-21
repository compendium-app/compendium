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
  graph: Graph;
  nodeSelected?: (node: string) => void;
}

export const DiagramNetwork = (props: DiagramNetworkProps) => {
  const { graph, nodeSelected } = props;

  const networkRef = useRef();
  useEffect(() => {
    if (networkRef.current) {
      (networkRef.current as any).network.on("click", (event: any) => {
        console.log("=>", event.nodes[0]);
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
          layout: {
            randomSeed: 2000,
            // hierarchical: {
            //   direction: "UD",
            // },
          },
          physics: { enabled: true },
        }}
      >
        {Object.values(graph.nodes).map((n) => (
          <Node key={n.id} id={n.id} label={n.name} />
        ))}
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
