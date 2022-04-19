import React, { useState } from "react";

// import Graph from "vis-react";
import { gql, useQuery } from "@apollo/client";
import { DiagramNetwork, Graph, Node, Edge } from "./network";

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

interface Response {
  node: Node;
}

interface DiagramProps {
  node: string;
  nodeSelected?: (node: string) => void;
}

export const Diagram = (props: DiagramProps) => {
  const { node: initialNode, nodeSelected } = props;
  const [node, setNode] = useState(initialNode);
  const [graph, setGraph] = useState<Graph>({ nodes: {}, edges: {} });
  useQuery<Response>(GET_NODE, {
    variables: { id: node },
    onCompleted: (data) => {
      const nodes = { ...graph.nodes } as { [key: string]: Node };
      const edges = { ...graph.edges } as { [key: string]: Edge };
      nodes[data.node.id] = data.node;

      for (const d of data.node.dependencies) {
        if (!d.node) continue;
        const from = data.node.id;
        const to = d.node.id;
        const id = `${from}_${to}`;
        edges[id] = { from, to, id, length: 200 };
        nodes[d.node.id] = d.node;
      }
      for (const d of data.node.dependants) {
        if (!d.node) continue;
        const to = data.node.id;
        const from = d.node.id;
        const id = `${from}_${to}`;
        edges[id] = { from, to, id, length: 200 };
        nodes[d.node.id] = d.node;
      }

      setGraph({ nodes, edges });
    },
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

      <DiagramNetwork
        graph={graph}
        nodeSelected={(node) => {
          setNode(node);
          if (nodeSelected) {
            nodeSelected(node);
          }
        }}
      />
    </>
  );
};
