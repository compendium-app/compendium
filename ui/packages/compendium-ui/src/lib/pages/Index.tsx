import { useSearchParams } from "react-router-dom";
import { Diagram } from "../components/diagram";
import { NodeDetailDrawer } from "../components/node-detail-drawer";
import { RecentNodes } from "../components/recent-nodes";

interface NodeSelection {
  selectedNode?: string;
  visibleNodes?: string[];
}

export const IndexPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const setNodeSelection = (selection: NodeSelection | null) => {
    console.log("??", selection);
    if (selection?.selectedNode) {
      searchParams.set("selected", selection.selectedNode);
    } else {
      searchParams.delete("selected");
    }
    if (selection?.visibleNodes) {
      searchParams.set("nodes", selection.visibleNodes.join(","));
    } else {
      searchParams.delete("nodes");
    }

    setSearchParams(searchParams);
  };

  const nodes = searchParams.get("nodes");
  const selection: NodeSelection = {
    selectedNode: searchParams.get("selected") || undefined,
    visibleNodes: nodes ? nodes.split(",") : undefined,
  };
  if (!selection.visibleNodes || selection.visibleNodes.length === 0) {
    return (
      <RecentNodes
        onNodeSelected={(id) => {
          setNodeSelection({
            selectedNode: id,
            visibleNodes: [id],
          });
        }}
      />
    );
  }
  return (
    <>
      {/* {JSON.stringify(selection)} */}
      {selection.selectedNode && (
        <NodeDetailDrawer
          nodeId={selection.selectedNode}
          onClose={() => setNodeSelection(null)}
          onNodeSelected={(id) =>
            setNodeSelection({
              selectedNode: id,
              visibleNodes: [id, ...(selection.visibleNodes || [])],
            })
          }
        />
      )}
      {selection.selectedNode && (
        <Diagram
          // key={JSON.stringify(selection)}
          nodeIds={selection.visibleNodes}
          selectedNodeId={selection.selectedNode}
          nodeSelected={(id, shift) => {
            setNodeSelection({
              selectedNode: id,
              visibleNodes: shift
                ? [id, ...(selection.visibleNodes || [])]
                : selection.visibleNodes,
            });
          }}
        />
      )}
    </>
  );
};
