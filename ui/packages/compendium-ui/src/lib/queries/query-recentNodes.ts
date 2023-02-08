import { gql } from "@apollo/client";
import { metadataFields, Node } from "./query-node";

export type RecentNodesResult = { recentNodes: Node[] };

export const QUERY_RECENT_NODES = gql`
  query getRecentNodes {
    recentNodes(limit: 30) {
      id
      name
      version
      metadata {
        ${metadataFields}
      }
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
