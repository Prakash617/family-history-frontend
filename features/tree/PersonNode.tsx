"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { User, Plus, MapPin, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

export const PersonNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as any;
  const isLiving = nodeData.isLiving;
  const gender = nodeData.gender;

  const genderColor =
    gender === "MALE"
      ? "border-sky-300 dark:border-sky-800 bg-sky-500/10 text-sky-700 dark:text-sky-300"
      : gender === "FEMALE"
      ? "border-rose-300 dark:border-rose-800 bg-rose-500/10 text-rose-700 dark:text-rose-300"
      : "border-border bg-secondary text-muted-foreground";

  return (
    <div
      className={cn(
        "relative w-[260px] rounded-xl border bg-card p-3 shadow-sm transition-all duration-150 select-none cursor-pointer",
        selected ? "border-primary ring-2 ring-primary/30 shadow-md" : "border-border hover:border-primary/50 hover:shadow-md"
      )}
    >
      {/* Top Handle for Parent-to-Child links */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-primary !border-2 !border-background"
      />

      {/* Left/Right Handles for Spouses */}
      <Handle
        type="source"
        position={Position.Left}
        id="spouse-left"
        className="!w-2 !h-2 !bg-pink-500 !border-background"
      />
      <Handle
        type="target"
        position={Position.Right}
        id="spouse-right"
        className="!w-2 !h-2 !bg-pink-500 !border-background"
      />

      <div className="flex items-start gap-3">
        {/* Profile Avatar */}
        <div className="relative shrink-0">
          {nodeData.photoUrl ? (
            <img
              src={nodeData.photoUrl}
              alt={nodeData.fullName}
              className="h-12 w-12 rounded-full object-cover border border-border"
            />
          ) : (
            <div
              className={cn(
                "h-12 w-12 rounded-full flex items-center justify-center font-semibold text-sm border",
                genderColor
              )}
            >
              {nodeData.firstName?.[0]}
              {nodeData.lastName?.[0]}
            </div>
          )}

          {/* Living indicator dot */}
          <span
            className={cn(
              "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card",
              isLiving ? "bg-emerald-500" : "bg-neutral-400"
            )}
            title={isLiving ? "Living" : "Deceased"}
          />
        </div>

        {/* Info Column */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <h4 className="font-semibold text-sm text-foreground truncate">{nodeData.fullName}</h4>
          </div>

          <p className="text-xs font-medium text-primary mt-0.5">{nodeData.lifespan}</p>

          {nodeData.birthPlace && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1 truncate">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{nodeData.birthPlace}</span>
            </div>
          )}

          {nodeData.occupation && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5 truncate">
              <Briefcase className="h-3 w-3 shrink-0" />
              <span className="truncate">{nodeData.occupation}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Handle for Children */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-primary !border-2 !border-background"
      />
    </div>
  );
});

PersonNode.displayName = "PersonNode";
