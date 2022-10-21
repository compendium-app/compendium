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

export const QUERY_NODE = gql`
  query getNode($id: ID!) {
    node(id: $id) {
      id
      name
      metadata {
        description
      }
      version
      dependencies {
        dependantVersion
        node {
          id
          name
          description
          version
        }
      }
      dependants {
        dependantVersion
        node {
          id
          name
          description
        }
      }
    }
  }
`;
