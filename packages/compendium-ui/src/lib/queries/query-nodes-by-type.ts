import { gql } from "@apollo/client";
import { Node } from "./query-node";

export type QueryNodesByTypeResult = { nodes: Node[] };

export const metadataFields = `description links { name url }`;

export const QUERY_NODES_BY_TYPE = gql`
  query getNodesByType($typeId: ID!) {
    nodes:nodesByType(typeId: $typeId) {
      id
      name
      metadata {
        ${metadataFields}
      }
    }
  }
`;
