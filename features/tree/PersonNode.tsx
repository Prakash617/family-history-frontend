"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";

export const PersonNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as any;
  const isFemale = nodeData.gender === "FEMALE";
  const gen = nodeData.generation ?? 0;

  // Authentic color scheme inspired by traditional Nepali Vamshavali posters:
  // - Female/Spouses: Pink
  // - Gen 1 (Root): Lavender/Purple
  // - Gen 2 & Som Bahadur branch: Sky Blue
  // - Gen 3 & Gen 5: Mint Green
  // - Gen 4: Light Amber
  // - Gen 6: Soft Violet
  let cardColor = "bg-[#f0fdf4] border-[#4ade80] text-[#14532d] shadow-sm"; // default green

  if (isFemale) {
    cardColor = "bg-[#fdf2f8] border-[#f472b6] text-[#9d174d] shadow-sm"; // Pink for female/spouses
  } else if (gen === 0) {
    cardColor = "bg-[#faf5ff] border-[#c084fc] text-[#6b21a8] shadow-sm"; // Lavender for Bagh Singh
  } else if (gen === 1 || nodeData.fullName?.includes("सोम बहादुर")) {
    cardColor = "bg-[#f0f9ff] border-[#38bdf8] text-[#0369a1] shadow-sm"; // Sky blue for Hasta / Som Bahadur
  } else if (gen === 2 || gen === 4) {
    cardColor = "bg-[#f0fdf4] border-[#4ade80] text-[#14532d] shadow-sm"; // Mint green for Gen 3 & 5
  } else if (gen === 3) {
    cardColor = "bg-[#fefce8] border-[#facc15] text-[#854d0e] shadow-sm"; // Light yellow for Gen 4
  } else if (gen >= 5) {
    cardColor = "bg-[#faf5ff] border-[#c084fc] text-[#6b21a8] shadow-sm"; // Violet for Gen 6
  }

  return (
    <div
      className={cn(
        "relative w-[190px] h-[58px] rounded-lg border-2 flex flex-col items-center justify-center px-2 py-1 text-center select-none cursor-pointer transition-all duration-150 font-sans",
        cardColor,
        selected ? "ring-4 ring-primary/40 scale-105 shadow-lg !border-primary" : "hover:scale-105 hover:shadow-md"
      )}
    >
      {/* Top Handle for Parent-Child connection */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-[#475569] !border-none"
      />

      {/* Left and Right Handles for Spouses */}
      <Handle
        type="source"
        position={Position.Left}
        id="spouse-left"
        className="!w-1.5 !h-1.5 !bg-[#d97706] !border-none"
      />
      <Handle
        type="target"
        position={Position.Right}
        id="spouse-right"
        className="!w-1.5 !h-1.5 !bg-[#d97706] !border-none"
      />

      {/* Main Bold Legible Nepali Name */}
      <span className="text-[15px] sm:text-[16px] font-bold tracking-tight truncate w-full px-1">
        {nodeData.fullName}
      </span>

      {/* Generation Tag */}
      <span className="text-[10px] font-medium opacity-75 mt-0.5">
        {nodeData.birthDisplay || `पुस्ता ${gen + 1}`}
      </span>

      {/* Bottom Handle for Children */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-[#475569] !border-none"
      />
    </div>
  );
});

PersonNode.displayName = "PersonNode";
