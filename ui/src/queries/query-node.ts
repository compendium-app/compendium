import { gql } from "@apollo/client";

export interface Depend {
  dependantVersion: string;
  node: Node;
}
export interface Node {
  id: string;
  name: string;
  version: string;
  dependencies: Depend[];
  dependants: Depend[];
}

export const QUERY_NODE = gql`
  query getNode($id: ID!) {
    node(id: $id) {
      id
      name
      version
      dependencies {
        dependantVersion
        node {
          id
          name
          version
        }
      }
      dependants {
        dependantVersion
        node {
          id
          name
        }
      }
    }
  }
`;
