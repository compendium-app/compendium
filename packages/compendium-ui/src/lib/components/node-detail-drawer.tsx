import { useQuery } from "@apollo/client";
import { Alert, Collapse, Drawer, List, Spin } from "antd";
import { QueryNodeResult, QUERY_NODE } from "../queries/query-node";
import { getNodeTypesColorMap } from "../helpers/node.helper";
import { Node } from "../queries/query-node";
import { NodeDetailDrawerNodes } from "./node-detail-drawer-nodes";

interface NodeDetailDrawerProps {
  nodeId: string;
  onClose: () => void;
  onNodeSelected: (id: string) => void;
}
export const NodeDetailDrawer = ({
  nodeId,
  onClose,
  onNodeSelected,
}: NodeDetailDrawerProps) => {
  const { data, loading, error } = useQuery<QueryNodeResult>(QUERY_NODE, {
    variables: { id: nodeId },
  });

  let nodeDependencies: Node[] =
    data?.node?.dependencies.filter((dep) => dep.node).map((dep) => dep.node) ||
    [];
  let nodeDependants: Node[] =
    data?.node?.dependants.filter((dep) => dep.node).map((dep) => dep.node) ||
    [];

  const typesColorMap = getNodeTypesColorMap(
    nodeDependencies.concat(nodeDependants)
  );

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
      {data && !data.node && (
        <Alert type="warning" message={`Node '${nodeId}' not found`} />
      )}
      {data?.node?.type && (
        <Collapse defaultActiveKey="type">
          <Collapse.Panel key="type" header={`Type`}>
            {data?.node?.type.name}
          </Collapse.Panel>
        </Collapse>
      )}
      <NodeDetailDrawerNodes
        panelKey={"dependencies"}
        inputNodes={nodeDependencies}
        header={`Dependencies (${nodeDependencies.length})`}
        searchPlaceholder={"Search in dependencies"}
        typesColorMap={typesColorMap}
        onNodeSelected={onNodeSelected}
        onClose={onClose}
      ></NodeDetailDrawerNodes>
      <NodeDetailDrawerNodes
        panelKey={"dependants"}
        inputNodes={nodeDependants}
        header={`Dependants (${nodeDependants.length})`}
        searchPlaceholder={"Search in dependants"}
        typesColorMap={typesColorMap}
        onNodeSelected={onNodeSelected}
        onClose={onClose}
      ></NodeDetailDrawerNodes>
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
