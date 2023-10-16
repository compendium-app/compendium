import { FC } from "react";
import { Link } from "react-router-dom";

import "./node-link.css";
import Card from "antd/lib/card/Card";
import { NodeItem } from "../../types/node-item";
import { Tooltip } from "antd";

interface NodeLinkProps extends NodeItem {}

const NodeLink: FC<NodeLinkProps> = ({ title, description, href }) => {
  return (
    <Link className="node-link" to={href}>
      <Tooltip title={title}>
        <Card title={title} bordered={false}>
          {description}
        </Card>
      </Tooltip>
    </Link>
  );
};

export default NodeLink;
