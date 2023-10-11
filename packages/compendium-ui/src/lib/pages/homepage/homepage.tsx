import CategoryLink from "../../components/category-link/category-link";

import "./homepage.css";
import { useQuery } from "@apollo/client";
import {
  QueryNodeTypesResult,
  QUERY_NODE_TYPES,
} from "../../queries/query-nodes-types";
import { Alert, Spin } from "antd";

const Homepage = () => {
  const { data, loading, error } =
    useQuery<QueryNodeTypesResult>(QUERY_NODE_TYPES);
  if (error) {
    return <Alert type="error" message={error.message} />;
  }

  return (
    <div className="homepage-wrapper">
      <div className="homepage-title-container">
        <h1>Hello there 👋</h1>
        <p>Select category and start exploring 🔭</p>
        <span />
      </div>
      <div className="categories-container">
        {loading && <Spin />}
        {data?.nodeTypes.map((category) => (
          <CategoryLink
            key={category.id}
            title={category.name}
            imgUrl={''}
            href={`/node-type/${category.id}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Homepage;
