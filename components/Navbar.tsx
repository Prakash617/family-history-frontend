"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TreePine, Bell, LogOut, User as UserIcon, Menu, X } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";

export default function Navbar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary tracking-tight">
            <TreePine className="h-6 w-6 text-primary" />
            <span className="hidden sm:inline">Family Historical Tree</span>
            <span className="sm:hidden">FamilyTree</span>
          </Link>
        </div>

        <nav className="flex items-center gap-3">
          <Link href="/tree">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-primary font-semibold">
              <TreePine className="h-4 w-4" />
              <span>वंशावली (Tree)</span>
            </Button>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                <UserIcon className="h-3.5 w-3.5" />
                <span>{user?.full_name || user?.email}</span>
              </div>

              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5 text-xs">
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
