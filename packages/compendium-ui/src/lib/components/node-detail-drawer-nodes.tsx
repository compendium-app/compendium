import { Badge, Collapse, Input, List, Typography } from "antd";
import { groupByNodeType } from "../helpers/node.helper";
import { Node } from "../queries/query-node";
import { useState } from "react";

interface NodeDetailDrawerProps {
  inputNodes: Node[];
  panelKey: string;
  header: string;
  searchPlaceholder: string;
  typesColorMap: Record<string, string>;
  onClose: () => void;
  onNodeSelected: (id: string) => void;
}
export const NodeDetailDrawerNodes = ({
  inputNodes,
  panelKey,
  header,
  searchPlaceholder,
  typesColorMap,
  onNodeSelected,
}: NodeDetailDrawerProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  let nodes = [...inputNodes];

  if (searchQuery) {
    nodes = nodes.filter(
      (d) =>
        d.name.indexOf(searchQuery) !== -1 || d.id.indexOf(searchQuery) !== -1
    );
  }

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  return (
    <>
      {nodes && (
        <Collapse>
          <Collapse.Panel key={panelKey} header={header}>
            <Input
              placeholder={searchPlaceholder}
              style={{ marginBottom: "5px" }}
              onChange={(event) => {
                handleSearchInputChange(event);
              }}
            />
            {nodes && (
              <Collapse>
                {Object.entries(groupByNodeType(nodes)).map(
                  ([typeId, nodes]) => (
                    <Collapse.Panel
                      key={typeId}
                      header={
                        <>
                          {typeId}{" "}
                          <Badge
                            count={nodes.length}
                            className="site-badge-count-109"
                            style={{ backgroundColor: typesColorMap[typeId] }}
                          />
                        </>
                      }
                    >
                      <List
                        dataSource={nodes}
                        renderItem={(i) => (
                          <List.Item key={i.id}>
                            <Typography.Link
                              href="#"
                              onClick={() => onNodeSelected(i.id)}
                            >
                              {i.name}
                            </Typography.Link>
                          </List.Item>
                        )}
                      ></List>
                    </Collapse.Panel>
                  )
                )}
              </Collapse>
            )}
          </Collapse.Panel>
        </Collapse>
      )}
    </>
  );
};
