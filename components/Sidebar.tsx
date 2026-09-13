"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  TreePine,
  Users,
  BookOpen,
  Image as ImageIcon,
  Calendar,
  Settings,
  Mail,
  X,
  ChevronDown,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import { Family } from "@/types";
import { cn } from "@/lib/utils";

interface SidebarProps {
  familyId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ familyId, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const { data: familiesData } = useQuery<{ results: Family[] }>({
    queryKey: ["families"],
    queryFn: () => apiRequest<{ results: Family[] }>("/families/"),
  });

  const families = familiesData?.results || [];
  const currentFamily = families.find((f) => f.id === familyId);

  const handleFamilyChange = (newFamId: string) => {
    if (!newFamId || newFamId === familyId) return;
    // Keep current section (tree, members, media, events, stories, settings)
    const segments = pathname.split("/");
    const section = segments[3] || "tree";
    router.push(`/family/${newFamId}/${section}`);
    onClose();
  };

  const links = familyId
    ? [
        { label: "Dashboard", href: `/dashboard`, icon: LayoutDashboard },
        { label: "Interactive Tree", href: `/family/${familyId}/tree`, icon: TreePine },
        { label: "People & Members", href: `/family/${familyId}/members`, icon: Users },
        { label: "Historical Stories", href: `/family/${familyId}/stories`, icon: BookOpen },
        { label: "Photos & Media", href: `/family/${familyId}/media`, icon: ImageIcon },
        { label: "Timeline Events", href: `/family/${familyId}/events`, icon: Calendar },
        { label: "Family Settings", href: `/family/${familyId}/settings`, icon: Settings },
      ]
    : [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "My Families", href: "/dashboard/families", icon: TreePine },
      ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-card p-4 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 pt-20 lg:pt-4",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between lg:hidden mb-4 px-2">
          <span className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
            Navigation
          </span>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Family Switcher Selector (when inside a family workspace) */}
        {familyId && families.length > 0 && (
          <div className="mb-4 pb-3 border-b border-border space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Active Lineage (सक्रिय परिवार)
              </span>
              <span className="text-[10px] text-primary font-semibold">
                {families.length} {families.length === 1 ? "Tree" : "Trees"}
              </span>
            </div>

            {families.length > 1 ? (
              <div className="relative">
                <select
                  value={familyId}
                  onChange={(e) => handleFamilyChange(e.target.value)}
                  className="w-full h-9 rounded-lg border border-input bg-background/80 px-2.5 py-1.5 text-xs font-semibold text-foreground outline-none cursor-pointer hover:border-primary focus:ring-1 focus:ring-primary truncate pr-7"
                  title="Switch between your family trees"
                >
                  {families.map((f) => (
                    <option key={f.id} value={f.id}>
                      🌳 {f.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            ) : (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 border border-border/60">
                <TreePine className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs font-semibold text-foreground truncate">
                  {currentFamily?.name || "Family Lineage"}
                </span>
              </div>
            )}
          </div>
        )}

        <nav className="space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => onClose()}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
