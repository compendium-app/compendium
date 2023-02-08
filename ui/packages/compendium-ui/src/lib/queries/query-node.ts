import { gql } from "@apollo/client";

export interface Depend {
  dependantVersion: string;
  node: Node;
}

interface NodeMetadata {
  description: string;
}
export interface Node {
  id: string;
  name: string;
  metadata?: NodeMetadata;
  version: string;
  dependencies: Depend[];
  dependants: Depend[];
}
export type QueryNodeResult = { node?: Node };

export const metadataFields = `description links { name url }`;

export const QUERY_NODE = gql`
  query getNode($id: ID!) {
    node(id: $id) {
      id
      name
      metadata {
        ${metadataFields}
      }
      version
      dependencies {
        dependantVersion
        node {
          id
          name
          version
          metadata {
            ${metadataFields}
          }
        }
      }
      dependants {
        dependantVersion
        node {
          id
          name
          metadata {
            ${metadataFields}
          }
        }
      }
    }
  }
`;
