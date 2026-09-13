import { Node, Edge } from "@xyflow/react";

export function layoutFamilyTree(nodes: Node[], edges: Edge[]) {
  // Group nodes by generation
  const generationGroups: Record<number, Node[]> = {};

  nodes.forEach((node) => {
    const gen = (node.data as any)?.generation ?? 0;
    if (!generationGroups[gen]) {
      generationGroups[gen] = [];
    }
    generationGroups[gen].push(node);
  });

  const nodeWidth = 260;
  const nodeHeight = 110;
  const horizontalGap = 60;
  const verticalGap = 160;

  const positionedNodes: Node[] = [];

  // Sort generations from oldest (lowest number or negative) to newest
  const sortedGenerations = Object.keys(generationGroups)
    .map(Number)
    .sort((a, b) => a - b);

  sortedGenerations.forEach((gen) => {
    const group = generationGroups[gen];
    const totalWidth = group.length * nodeWidth + (group.length - 1) * horizontalGap;
    const startX = -totalWidth / 2;
    const y = gen * verticalGap;

    group.forEach((node, index) => {
      const x = startX + index * (nodeWidth + horizontalGap);
      positionedNodes.push({
        ...node,
        position: { x, y },
      });
    });
  });

  return { nodes: positionedNodes, edges };
}
