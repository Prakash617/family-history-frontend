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
import { LayoutGrid, Network } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { TreeData, Person } from "@/types";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { PersonNode } from "@/features/tree/PersonNode";
import TreeToolbar from "@/features/tree/TreeToolbar";
import PersonDrawer from "@/features/tree/PersonDrawer";
import QuickAddModal from "@/features/tree/QuickAddModal";
import VamshavaliChartView from "@/features/tree/VamshavaliChartView";
import { layoutFamilyTree } from "@/features/tree/layout";

const nodeTypes = {
  personNode: PersonNode,
};

function TreeCanvas({
  familyId,
  onOpenDrawer,
  onQuickAdd,
}: {
  familyId: string;
  onOpenDrawer: (id: string) => void;
  onQuickAdd: (type: "CHILD" | "SPOUSE" | "PARENT", person: Person) => void;
}) {
  const { fitView, zoomIn, zoomOut, setCenter } = useReactFlow();
  const [depth, setDepth] = useState(10);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
      fitView({ padding: 0.15, duration: 600 });
    }, 120);
  }, [initialNodes, initialEdges, fitView, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const personId = (node.data as any)?.id;
      if (personId) {
        onOpenDrawer(personId);
      }
    },
    [onOpenDrawer]
  );

  const handleSearchSelect = useCallback(
    (personId: string) => {
      const targetNode = nodes.find((n) => (n.data as any)?.id === personId);
      if (targetNode) {
        setCenter(targetNode.position.x + 95, targetNode.position.y + 29, {
          zoom: 1.3,
          duration: 700,
        });
        onOpenDrawer(personId);
      }
    },
    [nodes, setCenter, onOpenDrawer]
  );

  const handleRecenter = useCallback(() => {
    fitView({ padding: 0.15, duration: 600 });
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

  const searchPeopleList = useMemo(() => {
    return (treeData?.nodes || []).map((n) => ({
      id: (n.data as any).id,
      fullName: (n.data as any).fullName,
    }));
  }, [treeData]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#faf8f5] dark:bg-[#141210]">
      <TreeToolbar
        onZoomIn={() => zoomIn({ duration: 300 })}
        onZoomOut={() => zoomOut({ duration: 300 })}
        onFitView={() => fitView({ padding: 0.15, duration: 500 })}
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
        <Background color="#cbd5e1" gap={24} size={1} />
        <Controls position="bottom-right" showInteractive={false} className="!border-border !shadow-md" />
        <MiniMap
          position="bottom-left"
          nodeColor={(n) => ((n.data as any)?.gender === "FEMALE" ? "#f472b6" : "#38bdf8")}
          className="!border-border !rounded-lg !shadow-md hidden md:block"
        />
      </ReactFlow>
    </div>
  );
}

export default function FamilyTreePage() {
  const params = useParams();
  const familyId = params.familyId as string;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"CHART" | "CANVAS">("CHART");
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  // Quick Add Modal state
  const [quickAddModalOpen, setQuickAddModalOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<"CHILD" | "SPOUSE" | "PARENT" | null>(null);
  const [quickAddTarget, setQuickAddTarget] = useState<Person | null>(null);

  const { data: peopleData } = useQuery<{ results: Person[] }>({
    queryKey: ["family-people", familyId],
    queryFn: () => apiRequest<{ results: Person[] }>(`/people/?family=${familyId}`),
  });

  const people = peopleData?.results || [];

  const handleSelectByName = (name: string) => {
    const cleanName = name.replace(/\s*\(.*?\)\s*/g, "").trim();
    const found = people.find(
      (p) =>
        p.full_name === cleanName ||
        p.first_name === cleanName ||
        cleanName.includes(p.first_name)
    );
    if (found) {
      setSelectedPersonId(found.id);
    }
  };

  const handleQuickAdd = (type: "CHILD" | "SPOUSE" | "PARENT", person: Person) => {
    setQuickAddType(type);
    setQuickAddTarget(person);
    setQuickAddModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* View Mode Switcher Header */}
      <div className="border-b border-border bg-card px-4 py-2 flex flex-wrap items-center justify-between gap-3 shadow-2xs z-30">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">दृष्टिकोण (View):</span>
          <div className="inline-flex p-1 rounded-lg bg-secondary border border-border">
            <button
              onClick={() => setViewMode("CHART")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                viewMode === "CHART"
                  ? "bg-card text-primary shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>वंशावली तालिका (Poster Chart)</span>
            </button>
            <button
              onClick={() => setViewMode("CANVAS")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                viewMode === "CANVAS"
                  ? "bg-card text-primary shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Network className="h-3.5 w-3.5" />
              <span>अन्तरक्रियात्मक क्यानभास (Interactive Flow)</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground hidden md:inline">
          💡 कुनै पनि सदस्यको विवरण हेर्न वा थप्न नाममा क्लिक गर्नुहोस्
        </p>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <Sidebar familyId={familyId} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 relative overflow-auto">
          {viewMode === "CHART" ? (
            <VamshavaliChartView onSelectPersonByName={handleSelectByName} />
          ) : (
            <div className="w-full h-[calc(100vh-115px)]">
              <ReactFlowProvider>
                <TreeCanvas
                  familyId={familyId}
                  onOpenDrawer={(id) => setSelectedPersonId(id)}
                  onQuickAdd={handleQuickAdd}
                />
              </ReactFlowProvider>
            </div>
          )}
        </main>
      </div>

      {/* Person Detail Drawer */}
      <PersonDrawer
        personId={selectedPersonId}
        onClose={() => setSelectedPersonId(null)}
        onSelectPerson={(id) => setSelectedPersonId(id)}
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
