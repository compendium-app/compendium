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
          nodeSelected={(id, shift, resetVisibleNodes) => {
            // If `resetVisibleNodes` is true, it will set only currently selected node as visible
            if (resetVisibleNodes) {
              setNodeSelection({
                selectedNode: id,
                visibleNodes: [id],
              });
              return;
            }

            let newVisibleNodes = [...(selection.visibleNodes || [])];

            //  If shift key is not pressed, simply select the node
            if (!shift) {
              setNodeSelection({
                selectedNode: id,
                visibleNodes: newVisibleNodes,
              });
              return;
            }

            // If we want another node to be visible but this node has been already selected - unselect it
            const nodeIsAlreadyVisible = newVisibleNodes.indexOf(id) !== -1;
            if (nodeIsAlreadyVisible) {
              newVisibleNodes = newVisibleNodes.filter((n) => n !== id);
            } else {
              newVisibleNodes = [id, ...newVisibleNodes];
            }

            setNodeSelection({
              selectedNode: id,
              visibleNodes: newVisibleNodes,
            });
          }}
        />
      )}
    </>
  );
};
