"use client";

import React, { useState } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Focus,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TreeToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onRecenter: () => void;
  onSearchSelect: (personId: string) => void;
  people: Array<{ id: string; fullName: string }>;
  depth: number;
  onDepthChange: (depth: number) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export default function TreeToolbar({
  onZoomIn,
  onZoomOut,
  onFitView,
  onRecenter,
  onSearchSelect,
  people,
  depth,
  onDepthChange,
  isFullscreen,
  onToggleFullscreen,
}: TreeToolbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filteredPeople = searchQuery.trim()
    ? people.filter((p) => p.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 bg-card/90 backdrop-blur-md p-2 rounded-xl border border-border shadow-md">
      {/* Search Input */}
      <div className="relative">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search ancestor..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setDropdownOpen(true);
            }}
            onFocus={() => setDropdownOpen(true)}
            className="bg-transparent border-none outline-none w-32 sm:w-44 text-xs placeholder:text-muted-foreground"
          />
        </div>

        {dropdownOpen && filteredPeople.length > 0 && (
          <div className="absolute left-0 top-full mt-1.5 w-56 rounded-lg border border-border bg-card shadow-lg max-h-48 overflow-y-auto z-30 p-1 divide-y divide-border">
            {filteredPeople.map((person) => (
              <button
                key={person.id}
                onClick={() => {
                  onSearchSelect(person.id);
                  setSearchQuery("");
                  setDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs rounded hover:bg-muted text-foreground transition-colors font-medium truncate"
              >
                {person.fullName}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Depth Filter */}
      <div className="flex items-center gap-1 border-l border-border pl-2">
        <span className="text-[11px] font-medium text-muted-foreground hidden sm:inline">Depth:</span>
        <select
          value={depth}
          onChange={(e) => onDepthChange(Number(e.target.value))}
          className="h-8 rounded border border-border bg-background px-2 text-xs font-medium text-foreground outline-none"
        >
          <option value={2}>2 Gen</option>
          <option value={4}>4 Gen</option>
          <option value={6}>6 Gen</option>
          <option value={10}>All</option>
        </select>
      </div>

      {/* Zoom / Viewport controls */}
      <div className="flex items-center gap-1 border-l border-border pl-2">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onZoomIn} title="Zoom In">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onZoomOut} title="Zoom Out">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onFitView} title="Fit View">
          <Focus className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleFullscreen} title="Toggle Fullscreen">
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
