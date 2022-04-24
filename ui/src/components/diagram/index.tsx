import React, { useState } from "react";

// import Graph from "vis-react";
import { gql, useQuery } from "@apollo/client";
import { DiagramNetwork, Graph, NodeVersion, Edge } from "./network";

const GET_NODE = gql`
  query getNode($id: ID!) {
    nodeVersions(id: $id) {
      id
      name
      version
      dependencies {
        nodeVersions {
          id
          name
          version
        }
      }
      dependants {
        nodeVersions {
          id
          name
          version
        }
      }
    }
  }
`;

interface Response {
  nodeVersions: NodeVersion[];
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
      const nodes = { ...graph.nodes } as { [key: string]: NodeVersion };
      const edges = { ...graph.edges } as { [key: string]: Edge };
      const node = data.nodeVersions[0];
      nodes[node.id] = node;

      for (const d of node.dependencies) {
        if (d.nodeVersions.length === 0) continue;
        const dn = d.nodeVersions[0];
        const from = node.id;
        const to = dn.id;
        const id = `${from}_${to}`;
        edges[id] = { from, to, id, length: 200 };
        nodes[dn.id] = dn;
      }
      for (const d of node.dependants) {
        if (d.nodeVersions.length === 0) continue;
        const dn = d.nodeVersions[0];
        const to = node.id;
        const from = dn.id;
        const id = `${from}_${to}`;
        edges[id] = { from, to, id, length: 200 };
        nodes[dn.id] = dn;
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
