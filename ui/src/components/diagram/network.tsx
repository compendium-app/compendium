import React, { useEffect, useRef } from "react";

import { Network, Node, Edge } from "@lifeomic/react-vis-network";

export interface Depend {
  node: Node;
}
export interface Node {
  id: string;
  name: string;
  dependencies: Depend[];
  dependants: Depend[];
}
export interface Edge {
  id: string;
  from: string;
  to: string;
  length: number;
}
export interface Graph {
  nodes: { [key: string]: Node };
  edges: { [key: string]: Edge };
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
          layout: { randomSeed: 2000 },
          edges: { arrows: { to: { enabled: true } } },
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
          />
        ))}
      </Network>
    </>
  );
};
