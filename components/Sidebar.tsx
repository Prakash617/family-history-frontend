"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  familyId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ familyId, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

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
