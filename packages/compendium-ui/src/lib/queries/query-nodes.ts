import { gql, useQuery } from "@apollo/client";
import { metadataFields } from "./query-node";

interface UseQueryNodesProps {
  ids: string[];
}

export const QUERY_NODE_FRAGMENT = (i: number) => `
node${i}:node(id: $id${i}) {
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
      metadata {
        ${metadataFields}
      }
      type {
        id
        name
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
      type {
        id
        name
      }
    }
  }
}
`;

export const useQueryNodes = ({ ids }: UseQueryNodesProps) => {
  const query = ids.map((_, i) => QUERY_NODE_FRAGMENT(i)).join("\n");
  const idsPrefix = ids.map((_, i) => `$id${i}:ID!`).join(",");
  const q = gql`
    query getNodes(${idsPrefix}) {
      ${query}
    }
  `;
  const variables: { [key: string]: string } = {};
  for (const i in ids) {
    variables["id" + i] = ids[i];
  }
  const { data, ...rest } = useQuery(q, { variables });
  let result = null;
  if (data) {
    result = [];
    for (const key in data) {
      result.push(data[key]);
    }
  }
  return { data: result, ...rest };
};
