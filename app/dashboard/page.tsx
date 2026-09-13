"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  TreePine,
  Users,
  BookOpen,
  Image as ImageIcon,
  Plus,
  ArrowRight,
  Shield,
  Activity,
  HeartHandshake,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Family } from "@/types";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState("");
  const [newFamilyDesc, setNewFamilyDesc] = useState("");

  const { data: familiesData, isLoading: familiesLoading } = useQuery({
    queryKey: ["families"],
    queryFn: () => apiRequest<{ results: Family[] }>("/families/"),
  });

  const families = familiesData?.results || [];
  const primaryFamily = families[0];

  const { data: dashboardStats } = useQuery({
    queryKey: ["family-dashboard", primaryFamily?.id],
    queryFn: () => apiRequest<any>(`/families/${primaryFamily.id}/dashboard/`),
    enabled: !!primaryFamily?.id && isAuthenticated,
  });

  const createFamilyMutation = useMutation({
    mutationFn: (data: { name: string; description: string }) =>
      apiRequest<Family>("/families/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (newFamily) => {
      queryClient.invalidateQueries({ queryKey: ["families"] });
      setCreateModalOpen(false);
      setNewFamilyName("");
      setNewFamilyDesc("");
      router.push(`/family/${newFamily.id}/tree`);
    },
  });

  const handleCreateFamily = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyName.trim()) return;
    createFamilyMutation.mutate({
      name: newFamilyName,
      description: newFamilyDesc,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          familyId={primaryFamily?.id}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Header & Quick Action */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
                Genealogy Overview
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {user ? `Welcome, ${user.full_name || user.email}` : "Explore families and lineages"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={() => setCreateModalOpen(true)} className="gap-2 shadow-xs">
                <Plus className="h-4 w-4" />
                Create New Family
              </Button>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-border bg-card">
              <CardContent className="p-4 sm:p-6 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Total Members
                  </span>
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground">
                  {dashboardStats?.total_members ?? (primaryFamily ? primaryFamily.members_count : 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {dashboardStats ? `${dashboardStats.living_members} living, ${dashboardStats.deceased_members} deceased` : "Across records"}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-4 sm:p-6 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Total Families
                  </span>
                  <TreePine className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground">{families.length}</div>
                <p className="text-xs text-muted-foreground">Managed lineages</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-4 sm:p-6 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Stories & Memories
                  </span>
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground">
                  {dashboardStats?.total_stories ?? 2}
                </div>
                <p className="text-xs text-muted-foreground">Oral histories preserved</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-4 sm:p-6 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Historical Photos
                  </span>
                  <ImageIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground">
                  {dashboardStats?.total_photos ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">Archived artifacts</p>
              </CardContent>
            </Card>
          </div>

          {/* Families Grid */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-foreground font-serif">
              Your Family Trees
            </h2>

            {familiesLoading ? (
              <div className="text-center py-12 text-sm text-muted-foreground">Loading families...</div>
            ) : families.length === 0 ? (
              <Card className="border-dashed border-2 border-border p-8 text-center space-y-4">
                <TreePine className="h-12 w-12 mx-auto text-muted-foreground" />
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">No family tree yet</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Create your first family to begin recording ancestral lineages and relatives.
                  </p>
                </div>
                <Button onClick={() => setCreateModalOpen(true)}>Create Family</Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {families.map((fam) => (
                  <Card key={fam.id} className="border-border hover:shadow-md transition-shadow flex flex-col justify-between">
                    <CardHeader className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{fam.privacy}</Badge>
                        <span className="text-xs text-muted-foreground">{fam.members_count} members</span>
                      </div>
                      <CardTitle className="text-xl font-serif">{fam.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{fam.description || "No description provided."}</CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0 space-y-3">
                      <div className="flex items-center gap-2 pt-2 border-t border-border">
                        <Link href={`/family/${fam.id}/tree`} className="flex-1">
                          <Button size="sm" className="w-full gap-1.5 text-xs">
                            <TreePine className="h-3.5 w-3.5" />
                            View Tree
                          </Button>
                        </Link>
                        <Link href={`/family/${fam.id}/members`}>
                          <Button size="sm" variant="outline" className="text-xs">
                            Members
                          </Button>
                        </Link>
                        <Link href={`/family/${fam.id}/stories`}>
                          <Button size="sm" variant="outline" className="text-xs">
                            Stories
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity Section */}
          {dashboardStats?.recent_activity && dashboardStats.recent_activity.length > 0 && (
            <div className="space-y-3 border-t border-border pt-6">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Recent Tree Activity
              </h3>
              <div className="divide-y divide-border rounded-lg border border-border bg-card">
                {dashboardStats.recent_activity.map((act: any, idx: number) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{act.title}</span>
                    <span className="text-xs text-muted-foreground">{new Date(act.timestamp).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Create Family Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Family"
        description="Establish a new family lineage container to start mapping ancestors."
      >
        <form onSubmit={handleCreateFamily} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Family Name</label>
            <Input
              required
              placeholder="e.g. Thapa Dynasty or Smith-Johnson Family"
              value={newFamilyName}
              onChange={(e) => setNewFamilyName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Description (Optional)</label>
            <Input
              placeholder="Brief description of origin or history"
              value={newFamilyDesc}
              onChange={(e) => setNewFamilyDesc(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createFamilyMutation.isPending}>
              {createFamilyMutation.isPending ? "Creating..." : "Create Family"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
