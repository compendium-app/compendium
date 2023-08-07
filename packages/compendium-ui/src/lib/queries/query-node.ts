import { gql } from "@apollo/client";

export interface Depend {
  dependantVersion: string;
  node: Node;
}

interface NodeMetadata {
  description: string;
}

interface Type {
  id: string;
  name: string;
}
export interface Node {
  id: string;
  name: string;
  metadata?: NodeMetadata;
  version: string;
  dependencies: Depend[];
  dependants: Depend[];
  type: Type;
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
      type {
        id
        name
      }
      dependencies {
        dependantVersion
        node {
          id
          name
          version
          type {
            id
            name
          }
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
          type {
            id
            name
          }
          metadata {
            ${metadataFields}
          }
        }
      }
    }
  }
`;
