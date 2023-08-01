import stringHash from "string-hash";
import { Node } from "../queries/query-node";

export const groupByNodeType = (array: Node[]) =>
  array.reduce<Record<string, Node[]>>(
    (grouped, element) => ({
      ...grouped,
      [element.type.id]: [...(grouped[element.type.id] || []), element],
    }),
    {}
  );

export function getUniqueTypes<T>(
  nodes: (T & { type: { id: string } })[]
): string[] {
  const uniqueValues: string[] = [];

  nodes.forEach((node) => {
    if (node && node.type && node.type.id && !uniqueValues.includes(node.type.id)) {
      uniqueValues.push(node.type.id);
    }
  });

  return uniqueValues;
}

export function getNodeTypesColorMap(nodes: Node[]) {
  const uniqueTypes = getUniqueTypes(nodes || []);
  const colorMap: Record<string, string> = {};
  uniqueTypes.forEach((type) => {
    const color = "#" + stringHash(type).toString(16).slice(0, 6);
    colorMap[type] = color;
  });
  return colorMap;
}
