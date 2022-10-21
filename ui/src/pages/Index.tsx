import { useSearchParams } from "react-router-dom";
import { Diagram } from "../components/diagram";
import { RecentNodes } from "../components/recent-nodes";

export const IndexPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const setNodeId = (id: string) => {
    searchParams.set("node", id);
    setSearchParams(searchParams);
  };

  const nodeId = searchParams.get("node");
  if (!nodeId) {
    return (
      <RecentNodes
        onNodeSelected={(id) => {
          setNodeId(id);
        }}
      />
    );
  }
  return (
    <Diagram
      node={nodeId}
      nodeSelected={(id) => {
        setNodeId(id);
      }}
    />
  );
};
