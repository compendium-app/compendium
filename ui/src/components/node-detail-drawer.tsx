import { useQuery } from "@apollo/client";
import { Alert, Collapse, Drawer, List, Spin } from "antd";
import { QueryNodeResult, QUERY_NODE } from "../queries/query-node";

interface NodeDetailDrawerProps {
  nodeId: string;
  onClose: () => void;
}
export const NodeDetailDrawer = ({
  nodeId,
  onClose,
}: NodeDetailDrawerProps) => {
  const { data, loading, error } = useQuery<QueryNodeResult>(QUERY_NODE, {
    variables: { id: nodeId },
  });

  const items = getContentItemsForObject(data?.node?.metadata);
  return (
    <Drawer
      mask={false}
      open={true}
      onClose={() => onClose()}
      title={data?.node?.name}
    >
      {loading && <Spin />}
      {error && <Alert type="error" message={error.message} />}
      {items}
    </Drawer>
  );
};

const getContentItemsForObject = (obj: any): React.ReactNode[] | null => {
  if (!obj) {
    return null;
  }
  if (typeof obj === "string") {
    return [obj];
  }
  const items: React.ReactNode[] = [];
  if (Array.isArray(obj)) {
    items.push(
      <List
        dataSource={obj}
        renderItem={(item, i) => {
          return (
            <List.Item key={`${i}`}>{getContentItemsForObject(item)}</List.Item>
          );
        }}
      />
    );
  } else if (typeof obj === "object" && obj["url"] && obj["name"]) {
    items.push(
      <a href={obj["url"]} target="_blank" rel="noreferrer">
        {obj["name"]}
      </a>
    );
    return items;
  } else if (typeof obj === "object") {
    const keys: string[] = [];
    for (const key in obj) {
      if (key === "__typename") {
        continue;
      }
      const content = getContentItemsForObject(obj[key]);
      if (content) {
        items.push(
          <Collapse.Panel key={key} header={key}>
            {content}
          </Collapse.Panel>
        );
        keys.push(key);
      }
    }
    if (items.length > 0) {
      return [<Collapse defaultActiveKey={keys}>{items}</Collapse>];
    }
  }

  return items;
};
