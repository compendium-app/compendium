import { useContext, useMemo } from "react";

import Graph from "react-graph-vis";

import { v4 as uuidv4 } from "uuid";
import { SettingsContext } from "../../contexts/settings";

export interface DataEdge {
  id: string;
  from: string;
  to: string;
  length: number;
  dashes: boolean;
  label?: string;
}

export interface DataNode {
  id: string;
  label: string;
  color: string;
  font: { color: string };
  type: string;
  borderWidth: number;
}

export interface Graph {
  nodes: DataNode[];
  edges: DataEdge[];
}

interface DiagramNetworkProps {
  selectedNodeIds: string[];
  visibleNodeIds: string[];
  typesColorMap: Record<string, string>;
  uniqueTypes: string[];
  graph: Graph;
  nodeSelected?: (
    node: string,
    shift: boolean,
    resetVisibleNodes: boolean
  ) => void;
}

export const DiagramNetwork = (props: DiagramNetworkProps) => {
  const {
    graph,
    nodeSelected,
    visibleNodeIds,
    selectedNodeIds,
    typesColorMap,
    uniqueTypes,
  } = props;

  const { settings, setSettings } = useContext(SettingsContext);

  // NOTE: there is a problem with updating graph nodes in visjs
  // It throws `A duplicate id was found in the parameter array.`
  // Therefore we're rerendering graph, when nodes are about to update
  const version = useMemo(uuidv4, [JSON.stringify(visibleNodeIds), settings]);

  const options = {
    width: "100%",
    height: "100%",
    edges: {
      arrows: { to: { enabled: true } },
      smooth: {
        type: "cubicBezier",
        forceDirection: "horizontal",
        roundness: 0.4,
      },
    },
    layout: {
      randomSeed: 2000,
    },
    physics: { enabled: true },
  };

  return (
    <>
      {graph && graph.nodes && Object.values(graph.nodes).length > 0 && (
        <Graph
          key={version}
          graph={graph}
          options={options}
          getNetwork={(network: any) => {
            network.on("click", (params: any) => {
              if (nodeSelected && params.nodes[0]) {
                const isShiftKeyPressed = params.event.srcEvent.shiftKey;
                const resetVisibleNodes = false;
                nodeSelected(
                  params.nodes[0],
                  isShiftKeyPressed,
                  resetVisibleNodes
                );
              }
            });

            network.on("doubleClick", (params: any) => {
              if (params.nodes.length == 1) {
                if (network.isCluster(params.nodes[0]) == true) {
                  network.openCluster(params.nodes[0]);
                } else if (nodeSelected) {
                  const resetVisibleNodes = true;
                  const isShiftKeyPressed = false;
                  nodeSelected(
                    params.nodes[0],
                    isShiftKeyPressed,
                    resetVisibleNodes
                  );
                }
              }
            });

            if (!settings.clusteringEnabled) {
              return;
            }

            //  if you want access to vis.js network api you can set the state in a parent component using this property
            let clusterOptionsByData;
            for (var i = 0; i < uniqueTypes.length; i++) {
              var type = uniqueTypes[i];
              clusterOptionsByData = {
                joinCondition: function (childOptions: any) {
                  return (
                    childOptions.type == type &&
                    visibleNodeIds.indexOf(childOptions.id) === -1
                  );
                },
                processProperties: function (
                  clusterOptions: any,
                  childNodes: any
                ) {
                  var totalMass = 0;
                  for (var i = 0; i < childNodes.length; i++) {
                    totalMass += childNodes[i].mass;
                  }
                  clusterOptions.mass = Math.log(totalMass);
                  return clusterOptions;
                },
                clusterNodeProperties: {
                  id: "cluster:" + type,
                  color: typesColorMap[type],
                  label: "type:" + type,
                  shape: "box",
                  margin: 10,
                },
              };
              network.cluster(clusterOptionsByData);
            }
          }}
        />
      )}
    </>
  );
};
