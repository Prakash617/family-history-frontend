import { Node, Edge } from "@xyflow/react";

export function layoutFamilyTree(nodes: Node[], edges: Edge[]) {
  // Map spouse relationships
  const spouseMap: Record<string, string> = {};
  edges.forEach((edge) => {
    if ((edge.data as any)?.relationshipType === "SPOUSE") {
      spouseMap[edge.source] = edge.target;
      spouseMap[edge.target] = edge.source;
    }
  });

  // Group nodes by generation
  const generationGroups: Record<number, Node[]> = {};

  nodes.forEach((node) => {
    const gen = (node.data as any)?.generation ?? 0;
    if (!generationGroups[gen]) {
      generationGroups[gen] = [];
    }
    generationGroups[gen].push(node);
  });

  const nodeWidth = 190;
  const standardGap = 50;
  const spouseGap = 28;
  const verticalGap = 140;

  const positionedNodes: Node[] = [];

  const sortedGenerations = Object.keys(generationGroups)
    .map(Number)
    .sort((a, b) => a - b);

  sortedGenerations.forEach((gen) => {
    const group = generationGroups[gen];

    // Order group so that spouse pairs are adjacent
    const orderedGroup: Node[] = [];
    const placed = new Set<string>();

    group.forEach((node) => {
      if (placed.has(node.id)) return;

      orderedGroup.push(node);
      placed.add(node.id);

      const spouseId = spouseMap[node.id];
      if (spouseId) {
        const spouseNode = group.find((n) => n.id === spouseId);
        if (spouseNode && !placed.has(spouseId)) {
          orderedGroup.push(spouseNode);
          placed.add(spouseId);
        }
      }
    });

    // Calculate total width of the row taking varying gaps into account
    let totalWidth = 0;
    for (let i = 0; i < orderedGroup.length; i++) {
      totalWidth += nodeWidth;
      if (i < orderedGroup.length - 1) {
        const curr = orderedGroup[i];
        const next = orderedGroup[i + 1];
        const isSpouseNext = spouseMap[curr.id] === next.id;
        totalWidth += isSpouseNext ? spouseGap : standardGap;
      }
    }

    let currentX = -totalWidth / 2;
    const y = gen * verticalGap;

    orderedGroup.forEach((node, index) => {
      positionedNodes.push({
        ...node,
        position: { x: currentX, y },
      });

      if (index < orderedGroup.length - 1) {
        const next = orderedGroup[index + 1];
        const isSpouseNext = spouseMap[node.id] === next.id;
        currentX += nodeWidth + (isSpouseNext ? spouseGap : standardGap);
      }
    });
  });

  return { nodes: positionedNodes, edges };
}
