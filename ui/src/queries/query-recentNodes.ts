import { gql } from "@apollo/client";
import { Node } from "./query-node";

export type RecentNodesResult = { recentNodes: Node[] };

export const QUERY_RECENT_NODES = gql`
  query getRecentNodes {
    recentNodes(limit: 30) {
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
