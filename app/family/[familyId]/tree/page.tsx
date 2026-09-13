"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { apiRequest } from "@/lib/api";
import { TreeData, Person } from "@/types";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { PersonNode } from "@/features/tree/PersonNode";
import TreeToolbar from "@/features/tree/TreeToolbar";
import PersonDrawer from "@/features/tree/PersonDrawer";
import QuickAddModal from "@/features/tree/QuickAddModal";
import { layoutFamilyTree } from "@/features/tree/layout";

const nodeTypes = {
  personNode: PersonNode,
};

function TreeCanvas({ familyId }: { familyId: string }) {
  const { fitView, zoomIn, zoomOut, setCenter } = useReactFlow();
  const [depth, setDepth] = useState(10);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  // Quick Add State
  const [quickAddModalOpen, setQuickAddModalOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<"CHILD" | "SPOUSE" | "PARENT" | null>(null);
  const [quickAddTarget, setQuickAddTarget] = useState<Person | null>(null);

  const { data: treeData, isLoading } = useQuery<TreeData>({
    queryKey: ["family-tree", familyId, depth],
    queryFn: () => apiRequest<TreeData>(`/families/${familyId}/tree/?depth=${depth}`),
  });

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!treeData?.nodes) return { nodes: [], edges: [] };
    return layoutFamilyTree(treeData.nodes as Node[], treeData.edges as Edge[]);
  }, [treeData]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 600 });
    }, 100);
  }, [initialNodes, initialEdges, fitView, setNodes, setEdges]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const personId = (node.data as any)?.id;
    if (personId) {
      setSelectedPersonId(personId);
    }
  }, []);

  const handleSearchSelect = useCallback(
    (personId: string) => {
      const targetNode = nodes.find((n) => (n.data as any)?.id === personId);
      if (targetNode) {
        setCenter(targetNode.position.x + 130, targetNode.position.y + 55, {
          zoom: 1.2,
          duration: 800,
        });
        setSelectedPersonId(personId);
      }
    },
    [nodes, setCenter]
  );

  const handleRecenter = useCallback(() => {
    fitView({ padding: 0.2, duration: 600 });
  }, [fitView]);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleQuickAdd = (type: "CHILD" | "SPOUSE" | "PARENT", person: Person) => {
    setQuickAddType(type);
    setQuickAddTarget(person);
    setQuickAddModalOpen(true);
  };

  const searchPeopleList = useMemo(() => {
    return (treeData?.nodes || []).map((n) => ({
      id: (n.data as any).id,
      fullName: (n.data as any).fullName,
    }));
  }, [treeData]);

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-[#faf8f5] dark:bg-[#141210]">
      {/* Interactive Toolbar */}
      <TreeToolbar
        onZoomIn={() => zoomIn({ duration: 300 })}
        onZoomOut={() => zoomOut({ duration: 300 })}
        onFitView={() => fitView({ padding: 0.2, duration: 500 })}
        onRecenter={handleRecenter}
        onSearchSelect={handleSearchSelect}
        people={searchPeopleList}
        depth={depth}
        onDepthChange={setDepth}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-xs z-10 text-sm text-muted-foreground font-medium">
          Tracing lineage & generating tree...
        </div>
      ) : nodes.length === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 z-10">
          <p className="text-base font-semibold text-foreground">No people recorded in this family yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Start by adding your first family member.</p>
        </div>
      ) : null}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
        maxZoom={2.0}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#c4b5a5" gap={24} size={1} />
        <Controls position="bottom-right" showInteractive={false} className="!border-border !shadow-md" />
        <MiniMap
          position="bottom-left"
          nodeColor={(n) => ((n.data as any)?.gender === "MALE" ? "#0284c7" : "#e11d48")}
          className="!border-border !rounded-lg !shadow-md hidden md:block"
        />
      </ReactFlow>

      {/* Person Detail Drawer */}
      <PersonDrawer
        personId={selectedPersonId}
        onClose={() => setSelectedPersonId(null)}
        onSelectPerson={(id) => handleSearchSelect(id)}
        onQuickAdd={handleQuickAdd}
      />

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={quickAddModalOpen}
        onClose={() => setQuickAddModalOpen(false)}
        familyId={familyId}
        targetPerson={quickAddTarget}
        relationType={quickAddType}
      />
    </div>
  );
}

export default function FamilyTreePage() {
  const params = useParams();
  const familyId = params.familyId as string;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar familyId={familyId} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 relative">
          <ReactFlowProvider>
            <TreeCanvas familyId={familyId} />
          </ReactFlowProvider>
        </main>
      </div>
    </div>
  );
}
