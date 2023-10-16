import CategoryLink from "../../components/category-link/category-link";

import "./node-type.css";
import { useQuery } from "@apollo/client";
import { Alert, Col, Row, Space, Spin } from "antd";
import { useParams } from "react-router-dom";
import {
  QUERY_NODES_BY_TYPE,
  QueryNodesByTypeResult,
} from "../../queries/query-nodes-by-type";
import NodeLink from "../../components/node-link/node-link";
import Search, { SearchProps } from "antd/lib/input/Search";
import { useState } from "react";

const NodeType = () => {
  const params = useParams();
  const nodeTypeId = params.nodeType;
  const [searchInput, setSearchInput] = useState("");

  const onSearch: SearchProps["onSearch"] = (
    value: string,
    event?:
      | React.ChangeEvent<HTMLInputElement>
      | React.MouseEvent<HTMLElement, MouseEvent>
      | React.KeyboardEvent<HTMLInputElement>
      | undefined
  ) => setSearchInput(value);

  const { data, loading, error } = useQuery<QueryNodesByTypeResult>(
    QUERY_NODES_BY_TYPE,
    {
      variables: {
        typeId: nodeTypeId,
      },
    }
  );

  const nodes = data?.nodes.filter(
    (n) =>
      n.id.toLowerCase().includes(searchInput) ||
      n.name.toLowerCase().includes(searchInput)
  );

  if (error) {
    return <Alert type="error" message={error.message} />;
  }

  return (
    <div className="page-wrapper">
      <div className="page-title-container">
        {/* TODO: task for getting node type by ID */}
        <h1>{nodeTypeId}</h1>
        <p>Click on the item to open graph</p>
        <span />
      </div>

      <Space direction="vertical" size="middle" style={{ display: "flex" }}>
        <Space>
          <Search
            placeholder="Search in nodes"
            allowClear
            onSearch={onSearch}
            style={{ width: 200 }}
          />
        </Space>

        <Row gutter={[16, 16]}>
          {loading && <Spin />}
          {nodes?.map((node) => (
            <Col span={6} key={`col${node.id}`}>
              <NodeLink
                key={node.id}
                title={node.name}
                description={node.metadata?.description || ""}
                href={
                  "/graph?" +
                  `selected=${encodeURIComponent(
                    node.id
                  )}&nodes=${encodeURIComponent(node.id)}`
                }
              />
            </Col>
          ))}
        </Row>
      </Space>
    </div>
  );
};

export default NodeType;
