"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Printer, Users, Hand, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TreeData, Person, Family } from "@/types";
import { resolvePhotoUrl } from "@/lib/utils";

export interface PosterPerson {
  id: string;
  fullName: string;
  gender: string;
  lifespan?: string;
  isLiving?: boolean;
  generation?: number;
  birthPlace?: string;
  occupation?: string;
  photoUrl?: string | null;
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
  const photo = resolvePhotoUrl(person.photoUrl);

  return (
    <div
      onClick={onClick}
      className={`min-w-[135px] sm:min-w-[165px] max-w-[210px] px-3 py-2 sm:py-2.5 rounded-xl border-2 text-center cursor-pointer shadow-xs hover:scale-105 hover:shadow-md transition-all select-none ${style.bg} ${style.border} ${style.text}`}
      title={`${person.fullName} - क्लिक गरी विवरण हेर्नुहोस्`}
    >
      {photo && (
        <div className="mb-1.5 flex justify-center">
          <img
            src={photo}
            alt={person.fullName}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-white/80 shadow-xs"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        </div>
      )}
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
        photoUrl: n.data?.photoUrl || null,
      });
    });
  }

  // 2. Supplement from people array
  if (people) {
    people.forEach((p) => {
      const existing = personMap.get(p.id);
      if (!existing) {
        personMap.set(p.id, {
          id: p.id,
          fullName: p.full_name,
          gender: p.gender,
          lifespan: p.lifespan,
          isLiving: p.is_living,
          generation: 0,
          birthPlace: p.birth_place,
          occupation: p.occupation,
          photoUrl: p.profile_photo || null,
        });
      } else if (!existing.photoUrl && p.profile_photo) {
        existing.photoUrl = p.profile_photo;
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
      if (spouseHasParents) {
        continue;
      }
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
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, panX: 0, panY: 0, moved: false });
  const containerRef = useRef<HTMLDivElement>(null);

  const forest = useMemo(() => buildPosterForest(treeData, people), [treeData, people]);

  // Handle native mouse wheel zoom with non-passive listener to avoid outer page scrolling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Zoom smoothly
      const factor = e.deltaY < 0 ? 1.09 : 0.91;
      setZoom((prev) => Math.min(2.5, Math.max(0.25, Number((prev * factor).toFixed(3)))));
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag with left click (button 0)
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest(".no-drag")) {
      return;
    }
    setIsDragging(true);
    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      panX: pan.x,
      panY: pan.y,
      moved: false,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.mouseX;
    const dy = e.clientY - dragStart.current.mouseY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      dragStart.current.moved = true;
    }
    setPan({
      x: dragStart.current.panX + dx,
      y: dragStart.current.panY + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleSelectPerson = (p: PosterPerson) => {
    // If the user was panning/dragging the chart, do not trigger person selection modal
    if (dragStart.current.moved) return;
    if (onSelectPersonById) {
      onSelectPersonById(p.id);
    }
    if (onSelectPersonByName) {
      onSelectPersonByName(p.fullName);
    }
  };

  const handlePrint = () => {
    // 1. Reset pan & zoom temporarily so in-page fallback is centered
    const prevPan = { ...pan };
    const prevZoom = zoom;
    setPan({ x: 0, y: 0 });
    setZoom(1);

    const chartEl = document.getElementById("printable-vamshavali-chart");
    if (!chartEl) {
      document.body.classList.add("printing-chart");
      window.print();
      setTimeout(() => {
        document.body.classList.remove("printing-chart");
        setPan(prevPan);
        setZoom(prevZoom);
      }, 1000);
      return;
    }

    // Measure natural width of the chart to compute precise fit scale
    const contentWidth = Math.max(chartEl.scrollWidth, 1200);
    const targetWidth = 1080;
    const printScale = contentWidth > targetWidth ? Number((targetWidth / contentWidth).toFixed(2)) : 0.88;

    // Collect all stylesheets from current document
    const styleTags = Array.from(document.querySelectorAll("link[rel='stylesheet'], style"))
      .map((tag) => tag.outerHTML)
      .join("\n");

    const printWindow = window.open("", "_blank", "width=1300,height=900");
    if (!printWindow) {
      // In-page print fallback if popup blocked
      document.body.classList.add("printing-chart");
      setTimeout(() => {
        window.print();
        setTimeout(() => {
          document.body.classList.remove("printing-chart");
          setPan(prevPan);
          setZoom(prevZoom);
        }, 1000);
      }, 150);
      return;
    }

    // Write dedicated, clean, standalone print document
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="ne">
      <head>
        <meta charset="UTF-8">
        <title>${familyTitle} - कुल वंशावली तालिका</title>
        ${styleTags}
        <style>
          @page {
            size: landscape;
            margin: 6mm;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #1e293b !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }
          .print-wrapper {
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            padding: 8px !important;
            transform: scale(${printScale});
            transform-origin: top center;
          }
          .bg-slate-400 {
            background-color: #64748b !important;
          }
          .no-print {
            display: none !important;
          }
        </style>
      </head>
      <body>
        <div class="print-wrapper">
          ${chartEl.innerHTML}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.focus();
              window.print();
              window.onafterprint = function() { window.close(); };
            }, 350);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();

    // Restore pan & zoom after triggering print
    setTimeout(() => {
      setPan(prevPan);
      setZoom(prevZoom);
    }, 500);
  };

  const familyTitle =
    family?.name || treeData?.meta?.rootPersonName
      ? `${family?.name || "परिवार"} वंशावली`
      : "कुल वंशावली तालिका";

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`w-full overflow-hidden bg-[#faf8f5] dark:bg-[#141210] h-[calc(100vh-115px)] relative flex flex-col items-center select-none ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      {/* Viewport controls (Excluded from print) */}
      <div className="no-print absolute top-3 z-30 flex flex-wrap items-center gap-2 bg-card/95 backdrop-blur-md p-2 rounded-xl border border-border shadow-md">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setZoom((z) => Math.min(2.5, Number((z + 0.15).toFixed(2))))}
          className="h-8 gap-1 text-xs"
        >
          <ZoomIn className="h-4 w-4" />
          Zoom In
        </Button>
        <span className="text-xs font-semibold px-1 text-muted-foreground tabular-nums">
          {Math.round(zoom * 100)}%
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setZoom((z) => Math.max(0.25, Number((z - 0.15).toFixed(2))))}
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
          title="Reset zoom and position to initial center"
        >
          <RotateCcw className="h-3.5 w-3.5 text-primary" />
          <span>Reset Position (रिसेट)</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="h-8 gap-1 text-xs print-trigger-btn"
        >
          <Printer className="h-4 w-4" />
          Print / PDF
        </Button>

        <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-border text-[11px] text-muted-foreground font-medium">
          <Move className="h-3 w-3 text-primary" />
          <span>Drag to pan • Mouse wheel to zoom</span>
        </div>
      </div>

      {/* Pannable & Zoomable Chart Area */}
      <div
        className="w-full h-full flex items-center justify-center pointer-events-none"
      >
        <div
          id="printable-vamshavali-chart"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.08s ease-out",
          }}
          className="pointer-events-auto flex flex-col items-center min-w-max p-12 sm:p-24"
        >
          {/* Poster Header */}
          <div className="text-center mb-10 space-y-1 select-text">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1e293b] dark:text-[#f1f5f9] tracking-wide font-serif">
              {familyTitle}
            </h1>
            <div className="flex items-center justify-center gap-2 text-primary pt-1">
              <div className="h-0.5 w-16 bg-primary/40 rounded-full" />
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                पुर्ख्यौली अभिलेख • कुल वंशावली तालिका
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
            <div className="flex flex-col items-center gap-14 w-full">
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
    </div>
  );
}
