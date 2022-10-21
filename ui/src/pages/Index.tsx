import { useSearchParams } from "react-router-dom";
import { Diagram } from "../components/diagram";
import { NodeDetailDrawer } from "../components/node-detail-drawer";
import { RecentNodes } from "../components/recent-nodes";

export const IndexPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const setNodeId = (id: string | null) => {
    if (id) {
      searchParams.set("node", id);
    } else {
      searchParams.delete("node");
    }

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
    <>
      {nodeId && (
        <NodeDetailDrawer
          nodeId={nodeId}
          onClose={() => setNodeId(null)}
          onNodeSelected={(id) => setNodeId(id)}
        />
      )}
      <Diagram
        key={nodeId}
        node={nodeId}
        nodeSelected={(id) => {
          setNodeId(id);
        }}
      />
    </>
  );
};
