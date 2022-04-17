import React, { useEffect, useRef, useState } from "react";

import { Network, Node, Edge } from "@lifeomic/react-vis-network";
// import Graph from "vis-react";
import { gql, useQuery } from "@apollo/client";
import { Button } from "antd";

const GET_NODE = gql`
  query getNode($id: ID!) {
    node(id: $id) {
      id
      name
      dependencies {
        node {
          id
          name
        }
      }
      dependants {
        node {
          id
          name
        }
      }
    }
  }
`;

interface Depend {
  node: Node;
}
interface Node {
  id: string;
  name: string;
  dependencies: Depend[];
  dependants: Depend[];
}
interface Edge {
  id: string;
  from: string;
  to: string;
}
interface Response {
  node: Node;
}
interface Graph {
  nodes: { [key: string]: Node };
  edges: { [key: string]: Edge };
}

export const Diagram = () => {
  const [node, setNode] = useState("test");
  const [graph, setGraph] = useState<Graph>({ nodes: {}, edges: {} });
  const { loading, error, data, refetch } = useQuery<Response>(GET_NODE, {
    variables: { id: node },
    onCompleted: (data) => {
      const nodes = { ...graph.nodes } as { [key: string]: Node };
      const edges = { ...graph.edges } as { [key: string]: Edge };
      nodes[data.node.id] = data.node;

      for (const d of data.node.dependencies) {
        const from = data.node.id;
        const to = d.node.id;
        const id = `${from}_${to}`;
        edges[id] = { from, to, id };
        nodes[d.node.id] = d.node;
      }
      for (const d of data.node.dependants) {
        const to = data.node.id;
        const from = d.node.id;
        const id = `${from}_${to}`;
        edges[id] = { from, to, id };
        nodes[d.node.id] = d.node;
      }

      setGraph({ nodes, edges });
    },
  });
  const networkRef = useRef();
  useEffect(() => {
    if (networkRef.current) {
      (networkRef.current as any).network.on("click", (event: any) => {
        console.log("=>", event.nodes[0]);
        setNode(event.nodes[0]);
      });
    }
  });
  return (
    <>
      {/* {JSON.stringify(data, null, "")} */}
      {/* <h4>Nodes:</h4>
      <ul>
        {Object.values(graph.nodes).map((n) => (
          <li onClick={() => setNode(n.id)}>
            {n.id} - {n.name}
          </li>
        ))}
      </ul>
      <h4>Edges:</h4>
      <ul>
        {Object.values(graph.edges).map((n) => (
          <li key={`${n.id}`} onClick={() => setNode(n.from)}>
            {n.id} - {n.from} {"=>"} {n.to}
          </li>
        ))}
      </ul> */}

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
          <Edge key={e.id} id={e.id} from={e.from} to={e.to} />
        ))}
      </Network>
    </>
  );
};
