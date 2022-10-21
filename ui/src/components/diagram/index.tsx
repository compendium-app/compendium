import { useState } from "react";

// import Graph from "vis-react";
import { useQuery } from "@apollo/client";
import { Node, QUERY_NODE } from "../../queries/query-node";
import { DataEdge, DiagramNetwork, Graph } from "./network";

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
  useQuery<Response>(QUERY_NODE, {
    variables: { id: node },
    onCompleted: (data) => {
      const nodes = { ...graph.nodes } as { [key: string]: Node };
      const edges = { ...graph.edges } as { [key: string]: DataEdge };
      const node = data.node;
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
