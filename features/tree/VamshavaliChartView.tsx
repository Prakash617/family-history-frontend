"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Printer, Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TreeData, Person, Family } from "@/types";

export interface PosterPerson {
  id: string;
  fullName: string;
  gender: string;
  lifespan?: string;
  isLiving?: boolean;
  generation?: number;
  birthPlace?: string;
  occupation?: string;
}

export interface PosterNode {
  person: PosterPerson;
  spouse?: PosterPerson | null;
  children: PosterNode[];
}

interface VamshavaliChartViewProps {
  family?: Family | null;
  treeData?: TreeData | null;
  people?: Person[];
  onSelectPersonByName?: (name: string) => void;
  onSelectPersonById?: (id: string) => void;
}

function getCardStyle(gender: string, generation: number, isSpouse: boolean) {
  if (isSpouse || gender === "FEMALE") {
    return {
      bg: "bg-[#fdf2f8] dark:bg-pink-950/40",
      border: "border-[#f472b6] dark:border-pink-500/60",
      text: "text-[#9d174d] dark:text-pink-200",
    };
  }
  switch (generation % 5) {
    case 0:
      return {
        bg: "bg-[#faf5ff] dark:bg-purple-950/40",
        border: "border-[#c084fc] dark:border-purple-500/60",
        text: "text-[#6b21a8] dark:text-purple-200",
      };
    case 1:
      return {
        bg: "bg-[#f0f9ff] dark:bg-sky-950/40",
        border: "border-[#38bdf8] dark:border-sky-500/60",
        text: "text-[#0369a1] dark:text-sky-200",
      };
    case 2:
      return {
        bg: "bg-[#f0fdf4] dark:bg-emerald-950/40",
        border: "border-[#4ade80] dark:border-emerald-500/60",
        text: "text-[#14532d] dark:text-emerald-200",
      };
    case 3:
      return {
        bg: "bg-[#fefce8] dark:bg-amber-950/40",
        border: "border-[#facc15] dark:border-amber-500/60",
        text: "text-[#854d0e] dark:text-amber-200",
      };
    default:
      return {
        bg: "bg-[#f8fafc] dark:bg-slate-900/60",
        border: "border-[#94a3b8] dark:border-slate-600",
        text: "text-[#1e293b] dark:text-slate-200",
      };
  }
}

function PosterCard({
  person,
  isSpouse = false,
  generation = 0,
  onClick,
}: {
  person: PosterPerson;
  isSpouse?: boolean;
  generation?: number;
  onClick: () => void;
}) {
  const style = getCardStyle(person.gender, generation, isSpouse);

  return (
    <div
      onClick={onClick}
      className={`min-w-[135px] sm:min-w-[165px] max-w-[210px] px-3 py-2 sm:py-2.5 rounded-xl border-2 text-center cursor-pointer shadow-xs hover:scale-105 hover:shadow-md transition-all select-none ${style.bg} ${style.border} ${style.text}`}
      title={`${person.fullName} - क्लिक गरी विवरण हेर्नुहोस्`}
    >
      <div className="font-bold text-xs sm:text-sm leading-snug break-words">
        {person.fullName}
      </div>
      {person.lifespan && (
        <div className="text-[10px] opacity-75 mt-0.5 font-medium tracking-tight">
          {person.lifespan}
        </div>
      )}
      {person.occupation && (
        <div className="text-[10px] opacity-70 italic truncate mt-0.5">
          {person.occupation}
        </div>
      )}
    </div>
  );
}

function PosterBranch({
  node,
  generation = 0,
  onSelectPerson,
}: {
  node: PosterNode;
  generation?: number;
  onSelectPerson: (person: PosterPerson) => void;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const childCount = node.children.length;

  return (
    <div className="flex flex-col items-center">
      {/* Couple or Person Card */}
      <div className="flex items-center gap-1.5 sm:gap-2 z-10 select-none">
        <PosterCard
          person={node.person}
          generation={generation}
          onClick={() => onSelectPerson(node.person)}
        />
        {node.spouse && (
          <>
            <div
              className="flex items-center justify-center text-amber-600 px-1 font-bold text-lg select-none"
              title="विवाहित जोडी (Spouse)"
            >
              ⚭
            </div>
            <PosterCard
              person={node.spouse}
              isSpouse
              generation={generation}
              onClick={() => onSelectPerson(node.spouse!)}
            />
          </>
        )}
      </div>

      {/* Children branches */}
      {hasChildren && (
        <div className="flex flex-col items-center w-full">
          {/* Vertical drop stem from parent */}
          <div className="w-0.5 h-6 bg-slate-400" />

          {childCount === 1 ? (
            <PosterBranch
              node={node.children[0]}
              generation={generation + 1}
              onSelectPerson={onSelectPerson}
            />
          ) : (
            <div className="flex justify-center items-start pt-0 relative w-full">
              {node.children.map((child, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === childCount - 1;

                return (
                  <div
                    key={child.person.id}
                    className="flex flex-col items-center relative px-2 sm:px-3.5"
                  >
                    {/* Horizontal connecting line across siblings */}
                    <div
                      className={`absolute top-0 h-0.5 bg-slate-400 ${
                        isFirst
                          ? "left-1/2 right-0"
                          : isLast
                          ? "left-0 right-1/2"
                          : "left-0 right-0"
                      }`}
                    />
                    {/* Vertical drop line to child */}
                    <div className="w-0.5 h-6 bg-slate-400" />

                    {/* Child branch recursively */}
                    <PosterBranch
                      node={child}
                      generation={generation + 1}
                      onSelectPerson={onSelectPerson}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function buildPosterForest(treeData?: TreeData | null, people?: Person[]): PosterNode[] {
  const personMap = new Map<string, PosterPerson>();

  // 1. Populate from treeData.nodes
  if (treeData?.nodes) {
    treeData.nodes.forEach((n) => {
      const pid = n.data?.id || n.id.replace("person-", "");
      personMap.set(pid, {
        id: pid,
        fullName: n.data?.fullName || `${n.data?.firstName || ""} ${n.data?.lastName || ""}`.trim(),
        gender: n.data?.gender || "MALE",
        lifespan: n.data?.lifespan,
        isLiving: n.data?.isLiving,
        generation: n.data?.generation,
        birthPlace: n.data?.birthPlace,
        occupation: n.data?.occupation,
      });
    });
  }

  // 2. Supplement from people array
  if (people) {
    people.forEach((p) => {
      if (!personMap.has(p.id)) {
        personMap.set(p.id, {
          id: p.id,
          fullName: p.full_name,
          gender: p.gender,
          lifespan: p.lifespan,
          isLiving: p.is_living,
          generation: 0,
          birthPlace: p.birth_place,
          occupation: p.occupation,
        });
      }
    });
  }

  if (personMap.size === 0) return [];

  const spouseMap = new Map<string, string>();
  const parentToChildren = new Map<string, string[]>();
  const childToParents = new Map<string, Set<string>>();

  // 3. Populate relationships from treeData.edges
  if (treeData?.edges) {
    treeData.edges.forEach((e) => {
      const src = e.source.replace("person-", "");
      const tgt = e.target.replace("person-", "");
      const rel = e.data?.relationshipType || e.data?.relationship;

      if (rel === "SPOUSE") {
        spouseMap.set(src, tgt);
        spouseMap.set(tgt, src);
      } else if (rel === "PARENT_CHILD") {
        if (!childToParents.has(tgt)) childToParents.set(tgt, new Set());
        childToParents.get(tgt)!.add(src);

        if (!parentToChildren.has(src)) parentToChildren.set(src, []);
        if (!parentToChildren.get(src)!.includes(tgt)) {
          parentToChildren.get(src)!.push(tgt);
        }
      }
    });
  }

  // 4. Supplement from people.relatives if available
  if (people) {
    people.forEach((p) => {
      if (p.relatives?.parents) {
        p.relatives.parents.forEach((pr) => {
          if (!childToParents.has(p.id)) childToParents.set(p.id, new Set());
          childToParents.get(p.id)!.add(pr.id);

          if (!parentToChildren.has(pr.id)) parentToChildren.set(pr.id, []);
          if (!parentToChildren.get(pr.id)!.includes(p.id)) {
            parentToChildren.get(pr.id)!.push(p.id);
          }
        });
      }
      if (p.relatives?.spouses) {
        p.relatives.spouses.forEach((sp) => {
          spouseMap.set(p.id, sp.id);
          spouseMap.set(sp.id, p.id);
        });
      }
    });
  }

  // 5. Discover Roots (ancestors without parents in this family)
  const roots: string[] = [];
  for (const [pid] of personMap.entries()) {
    const hasParents = (childToParents.get(pid)?.size || 0) > 0;
    if (!hasParents) {
      const spouseId = spouseMap.get(pid);
      const spouseHasParents = spouseId ? (childToParents.get(spouseId)?.size || 0) > 0 : false;
      // If this person has no parents, but their spouse has parents in the tree,
      // they are an in-law married to a child in the tree, so display beside spouse.
      if (spouseHasParents) {
        continue;
      }
      // If neither has parents, ensure only one spouse is listed as root
      if (spouseId && spouseId < pid && roots.includes(spouseId)) {
        continue;
      }
      roots.push(pid);
    }
  }

  // 6. Build recursive trees
  const visited = new Set<string>();

  function buildBranch(pid: string, depth = 0): PosterNode | null {
    if (visited.has(pid)) return null;
    visited.add(pid);

    const person = personMap.get(pid)!;
    let spouse: PosterPerson | null = null;
    const spId = spouseMap.get(pid);
    if (spId && !visited.has(spId)) {
      visited.add(spId);
      spouse = personMap.get(spId) || null;
    }

    // Collect all children of this person and/or spouse
    const childSet = new Set<string>();
    (parentToChildren.get(pid) || []).forEach((c) => childSet.add(c));
    if (spId) {
      (parentToChildren.get(spId) || []).forEach((c) => childSet.add(c));
    }

    const children: PosterNode[] = [];
    for (const cid of Array.from(childSet)) {
      if (personMap.has(cid)) {
        const childBranch = buildBranch(cid, depth + 1);
        if (childBranch) children.push(childBranch);
      }
    }

    return {
      person,
      spouse,
      children,
    };
  }

  const forest: PosterNode[] = [];
  for (const rootId of roots) {
    const branch = buildBranch(rootId);
    if (branch) forest.push(branch);
  }

  // 7. Pick up any disconnected or unvisited members
  for (const [pid] of personMap.entries()) {
    if (!visited.has(pid)) {
      const branch = buildBranch(pid);
      if (branch) forest.push(branch);
    }
  }

  return forest;
}

export default function VamshavaliChartView({
  family,
  treeData,
  people,
  onSelectPersonByName,
  onSelectPersonById,
}: VamshavaliChartViewProps) {
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const forest = useMemo(() => buildPosterForest(treeData, people), [treeData, people]);

  // Center horizontally on initial mount or when data loads
  useEffect(() => {
    if (containerRef.current) {
      const el = containerRef.current;
      el.scrollLeft = Math.max(0, (el.scrollWidth - el.clientWidth) / 2);
    }
  }, [forest.length]);

  const handleReset = () => {
    setZoom(1);
    if (containerRef.current) {
      const el = containerRef.current;
      el.scrollTo({
        left: Math.max(0, (el.scrollWidth - el.clientWidth) / 2),
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const handleSelectPerson = (p: PosterPerson) => {
    if (onSelectPersonById) {
      onSelectPersonById(p.id);
    }
    if (onSelectPersonByName) {
      onSelectPersonByName(p.fullName);
    }
  };

  const familyTitle = family?.name || treeData?.meta?.rootPersonName ? `${family?.name || "परिवार"} वंशावली` : "कुल वंशावली तालिका";

  return (
    <div
      ref={containerRef}
      className="w-full overflow-auto p-4 sm:p-8 bg-[#faf8f5] dark:bg-[#141210] min-h-[85vh] flex flex-col items-center scroll-smooth"
    >
      {/* Viewport controls */}
      <div className="sticky top-2 z-20 flex flex-wrap items-center gap-2 bg-card/95 backdrop-blur-md p-2 rounded-xl border border-border shadow-md mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
          className="h-8 gap-1 text-xs"
        >
          <ZoomIn className="h-4 w-4" />
          Zoom In
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
          className="h-8 gap-1 text-xs"
        >
          <ZoomOut className="h-4 w-4" />
          Zoom Out
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="h-8 gap-1.5 text-xs font-semibold bg-secondary/80 hover:bg-secondary text-foreground border-border"
          title="Reset zoom and scroll to initial center position"
        >
          <RotateCcw className="h-3.5 w-3.5 text-primary" />
          <span>Reset Position (रिसेट)</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
          className="h-8 gap-1 text-xs"
        >
          <Printer className="h-4 w-4" />
          Print / PDF
        </Button>
      </div>

      {/* Main Chart Container */}
      <div
        style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
        className="transition-transform duration-150 flex flex-col items-center w-full min-w-max pb-24"
      >
        {/* Poster Header */}
        <div className="text-center mb-8 space-y-1">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1e293b] dark:text-[#f1f5f9] tracking-wide font-serif">
            {familyTitle}
          </h1>
          <div className="flex items-center justify-center gap-2 text-primary pt-1">
            <div className="h-0.5 w-16 bg-primary/40 rounded-full" />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              पुर्ख्यौली अभिलेख • कुल वंशावली
            </span>
            <div className="h-0.5 w-16 bg-primary/40 rounded-full" />
          </div>
          {family?.description && (
            <p className="text-xs text-muted-foreground max-w-xl mx-auto pt-1 line-clamp-2">
              {family.description}
            </p>
          )}
        </div>

        {/* Dynamic Generational Tree Hierarchy */}
        {forest.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground space-y-2">
            <Users className="h-8 w-8 mx-auto text-muted-foreground" />
            <p>No family members found to display on the poster chart.</p>
            <p className="text-xs">Add family members to see the traditional lineage poster generated automatically.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-12 w-full">
            {forest.map((rootNode) => (
              <PosterBranch
                key={rootNode.person.id}
                node={rootNode}
                generation={0}
                onSelectPerson={handleSelectPerson}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
