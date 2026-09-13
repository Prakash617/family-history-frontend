"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { LayoutGrid, Network, UserPlus } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { TreeData, Person, Family } from "@/types";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
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

  const handleReset = useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setTimeout(() => {
      fitView({ padding: 0.15, duration: 600 });
    }, 50);
  }, [initialNodes, initialEdges, fitView, setNodes, setEdges]);

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
        onReset={handleReset}
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
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"CHART" | "CANVAS">("CANVAS");
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  // Quick Add Modal state (from person drawer)
  const [quickAddModalOpen, setQuickAddModalOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<"CHILD" | "SPOUSE" | "PARENT" | null>(null);
  const [quickAddTarget, setQuickAddTarget] = useState<Person | null>(null);

  // Add Member Modal state (from top header)
  const [addPersonModalOpen, setAddPersonModalOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER">("MALE");
  const [birthYearApprox, setBirthYearApprox] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [occupation, setOccupation] = useState("");
  const [isLiving, setIsLiving] = useState(true);
  const [biography, setBiography] = useState("");
  const [memberPrivacy, setMemberPrivacy] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [relationType, setRelationType] = useState<"NONE" | "CHILD_OF" | "SPOUSE_OF" | "PARENT_OF">("NONE");
  const [relatedPersonId, setRelatedPersonId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { data: family } = useQuery<Family>({
    queryKey: ["family", familyId],
    queryFn: () => apiRequest<Family>(`/families/${familyId}/`),
  });

  const isThapaLineage =
    family?.id === "6461157e-ffb4-4b33-8864-69280b4620ac" ||
    family?.name?.toLowerCase().includes("thapa") ||
    family?.name?.includes("थापा");

  // Automatically select CHART for seeded Thapa lineage, CANVAS for custom families
  React.useEffect(() => {
    if (family) {
      if (isThapaLineage) {
        setViewMode("CHART");
      } else {
        setViewMode("CANVAS");
      }
    }
  }, [family, isThapaLineage]);

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

  const resetForm = () => {
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setBirthYearApprox("");
    setBirthPlace("");
    setOccupation("");
    setBiography("");
    setIsLiving(true);
    setRelationType("NONE");
    setRelatedPersonId("");
    setFormError(null);
  };

  const createPersonMutation = useMutation({
    mutationFn: async (newPersonData: any) => {
      // 1. Create Person
      const newPerson = await apiRequest<Person>("/people/", {
        method: "POST",
        body: JSON.stringify(newPersonData),
      });

      // 2. Create relationship if specified
      if (relationType === "CHILD_OF" && relatedPersonId) {
        await apiRequest("/relationships/", {
          method: "POST",
          body: JSON.stringify({
            family: familyId,
            person_a: relatedPersonId, // Parent
            person_b: newPerson.id,    // Child
            relationship_type: "PARENT_CHILD",
            relationship_subtype: "BIOLOGICAL",
          }),
        });
      } else if (relationType === "PARENT_OF" && relatedPersonId) {
        await apiRequest("/relationships/", {
          method: "POST",
          body: JSON.stringify({
            family: familyId,
            person_a: newPerson.id,    // Parent
            person_b: relatedPersonId, // Child
            relationship_type: "PARENT_CHILD",
            relationship_subtype: "BIOLOGICAL",
          }),
        });
      } else if (relationType === "SPOUSE_OF" && relatedPersonId) {
        await apiRequest("/marriages/", {
          method: "POST",
          body: JSON.stringify({
            family: familyId,
            partner_1: relatedPersonId,
            partner_2: newPerson.id,
            partnership_type: "MARRIAGE",
            end_reason: "ONGOING",
          }),
        });
        await apiRequest("/relationships/", {
          method: "POST",
          body: JSON.stringify({
            family: familyId,
            person_a: relatedPersonId,
            person_b: newPerson.id,
            relationship_type: "SPOUSE",
          }),
        });
      }

      return newPerson;
    },
    onSuccess: (newPerson) => {
      queryClient.invalidateQueries({ queryKey: ["family-people", familyId] });
      queryClient.invalidateQueries({ queryKey: ["family-tree", familyId] });
      queryClient.invalidateQueries({ queryKey: ["families"] });
      queryClient.invalidateQueries({ queryKey: ["family-dashboard", familyId] });
      setAddPersonModalOpen(false);
      resetForm();
      toast({
        title: "Member Added (सदस्य थपियो)",
        description: `${newPerson.full_name} has been added successfully.`,
        type: "success",
      });
    },
    onError: (err: any) => {
      setFormError(err?.message || "Failed to add member.");
      toast({
        title: "Error",
        description: err?.message || "Could not add family member.",
        type: "error",
      });
    },
  });

  const handleCreatePerson = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!firstName.trim()) {
      setFormError("First name is required.");
      return;
    }
    if (relationType !== "NONE" && !relatedPersonId) {
      setFormError("Please select the related family member.");
      return;
    }

    createPersonMutation.mutate({
      family: familyId,
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      gender,
      birth_year_approx: birthYearApprox,
      birth_place: birthPlace,
      occupation,
      biography,
      is_living: isLiving,
      privacy: memberPrivacy,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* View Mode Switcher Header */}
      <div className="border-b border-border bg-card px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs z-30">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base text-foreground font-serif leading-tight">
                {family?.name || "Family Tree"}
              </h2>
              {family && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-medium">
                  {family.privacy === "PUBLIC" ? "🌐 Public" : family.privacy === "PRIVATE" ? "🔒 Private" : "✉️ Invite Only"}
                </Badge>
              )}
            </div>
            {family?.description && (
              <p className="text-[11px] text-muted-foreground line-clamp-1 max-w-md mt-0.5">
                {family.description}
              </p>
            )}
          </div>

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

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => setAddPersonModalOpen(true)}
            className="h-8 gap-1.5 text-xs font-semibold shadow-2xs"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Add Member (सदस्य थप्नुहोस्)</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <Sidebar familyId={familyId} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 relative overflow-auto">
          {viewMode === "CHART" ? (
            isThapaLineage ? (
              <VamshavaliChartView onSelectPersonByName={handleSelectByName} />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 space-y-4 max-w-lg mx-auto my-16 bg-card rounded-2xl border border-border shadow-sm text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <LayoutGrid className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-foreground font-serif">
                  Traditional Poster View
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The printed traditional poster design is specifically formatted for the 6-generation <b>थापा परिवार वंशावली</b>.
                  For <b>{family?.name || "your family"}</b>, please use the <b>Interactive Flow</b> view to view and manage all {people.length} member records.
                </p>
                <Button onClick={() => setViewMode("CANVAS")} className="gap-2">
                  <Network className="h-4 w-4" />
                  Switch to Interactive Canvas
                </Button>
              </div>
            )
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

      {/* Quick Add Modal (Relative of target) */}
      <QuickAddModal
        isOpen={quickAddModalOpen}
        onClose={() => setQuickAddModalOpen(false)}
        familyId={familyId}
        targetPerson={quickAddTarget}
        relationType={quickAddType}
      />

      {/* Add Member Modal (Direct from Tree view) */}
      <Modal
        isOpen={addPersonModalOpen}
        onClose={() => setAddPersonModalOpen(false)}
        title="Add Family Member (नयाँ सदस्य थप्नुहोस्)"
        description="Record a new ancestor or living relative and connect them into the lineage."
      >
        <form onSubmit={handleCreatePerson} className="space-y-4">
          {formError && (
            <div className="p-2.5 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs font-medium">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">First Name *</label>
              <Input required placeholder="First" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Middle Name</label>
              <Input placeholder="Middle" value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Last Name</label>
              <Input placeholder="Last" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>

          {/* Genealogical Tree Connection */}
          {people.length > 0 && (
            <div className="space-y-2 p-3 rounded-lg border border-primary/20 bg-primary/5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-primary">
                  Connect to Family Tree (पारिवारिक सम्बन्ध जोड्नुहोस्)
                </label>
                <span className="text-[11px] text-muted-foreground">ऐच्छिक (Optional)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1">सम्बन्ध प्रकार (Type)</label>
                  <select
                    value={relationType}
                    onChange={(e) => setRelationType(e.target.value as any)}
                    className="h-9 w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground outline-none"
                  >
                    <option value="NONE">Standalone / New Root (नयाँ पुर्खा)</option>
                    <option value="CHILD_OF">Child of (को सन्तान)</option>
                    <option value="SPOUSE_OF">Spouse of (को जीवनसाथी)</option>
                    <option value="PARENT_OF">Parent of (को बुबा/आमा)</option>
                  </select>
                </div>
                {relationType !== "NONE" && (
                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-1">सदस्य छान्नुहोस् (Relative)</label>
                    <select
                      value={relatedPersonId}
                      onChange={(e) => setRelatedPersonId(e.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground outline-none font-medium"
                    >
                      <option value="">-- सदस्य छान्नुहोस् --</option>
                      {people.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.full_name} ({p.gender === "FEMALE" ? "Female" : "Male"})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none"
              >
                <option value="MALE">Male (पुरुष)</option>
                <option value="FEMALE">Female (महिला)</option>
                <option value="OTHER">Other (अन्य)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Privacy (गोपनीयता)</label>
              <select
                value={memberPrivacy}
                onChange={(e) => setMemberPrivacy(e.target.value as any)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none"
              >
                <option value="PUBLIC">Public (सबैले देख्ने)</option>
                <option value="PRIVATE">Private (परिवार मात्र)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Birth Year (or Approx)</label>
              <Input
                placeholder="e.g. 1965 or circa 1920"
                value={birthYearApprox}
                onChange={(e) => setBirthYearApprox(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Birth Place</label>
              <Input
                placeholder="e.g. Kathmandu, Nepal"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Occupation</label>
              <Input
                placeholder="e.g. Architect"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="tree-is-living"
              checked={isLiving}
              onChange={(e) => setIsLiving(e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
            <label htmlFor="tree-is-living" className="text-sm font-medium text-foreground cursor-pointer">
              Person is currently living
            </label>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Biography / Notes</label>
            <textarea
              rows={3}
              placeholder="Life summary, notable achievements, memories..."
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setAddPersonModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createPersonMutation.isPending}>
              {createPersonMutation.isPending ? "Saving..." : "Save Person"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
