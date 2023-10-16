import { gql } from "@apollo/client";
import { Type } from "./query-node";

export type QueryNodeTypesResult = { nodeTypes: Type[] };

export const QUERY_NODE_TYPES = gql`
  query getNodeTypes {
    nodeTypes {
      id
      name
    }
  }
`;
