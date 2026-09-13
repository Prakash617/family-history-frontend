"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TreePine, Plus, Shield, Users, Settings, ArrowRight } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { Family } from "@/types";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function DashboardFamiliesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState("");
  const [newFamilyDesc, setNewFamilyDesc] = useState("");
  const [privacy, setPrivacy] = useState<"PUBLIC" | "PRIVATE" | "INVITE_ONLY">("PRIVATE");

  const { data: familiesData, isLoading } = useQuery<{ results: Family[] }>({
    queryKey: ["families"],
    queryFn: () => apiRequest<{ results: Family[] }>("/families/"),
  });

  const families = familiesData?.results || [];

  const createFamilyMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest<Family>("/families/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (newFam) => {
      queryClient.invalidateQueries({ queryKey: ["families"] });
      setCreateModalOpen(false);
      setNewFamilyName("");
      setNewFamilyDesc("");
      toast({ title: "Family Created", description: `Successfully created ${newFam.name}` });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyName.trim()) return;
    createFamilyMutation.mutate({
      name: newFamilyName,
      description: newFamilyDesc,
      privacy,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
                Manage Families
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                All ancestral trees and family lines you own or contribute to.
              </p>
            </div>

            <Button onClick={() => setCreateModalOpen(true)} className="gap-1.5 text-xs">
              <Plus className="h-4 w-4" />
              Create Family
            </Button>
          </div>

          {isLoading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">Loading families...</div>
          ) : families.length === 0 ? (
            <Card className="border-dashed border-2 border-border p-12 text-center space-y-3">
              <TreePine className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="font-semibold text-lg text-foreground">No families found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Create a family lineage to begin recording historical members and relatives.
              </p>
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
                        <Button size="sm" className="w-full gap-1 text-xs">
                          <TreePine className="h-3.5 w-3.5" />
                          View Tree
                        </Button>
                      </Link>
                      <Link href={`/family/${fam.id}/members`}>
                        <Button size="sm" variant="outline" className="text-xs">
                          Members
                        </Button>
                      </Link>
                      <Link href={`/family/${fam.id}/settings`}>
                        <Button size="sm" variant="ghost" className="p-2">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Create Family Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Family Lineage"
        description="Establish a new family tree container."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Family Name</label>
            <Input
              required
              placeholder="e.g. Gurung-Thapa Ancestry"
              value={newFamilyName}
              onChange={(e) => setNewFamilyName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Privacy Level</label>
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value as any)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none"
            >
              <option value="PRIVATE">Private (Only invited members)</option>
              <option value="PUBLIC">Public (Visible to everyone)</option>
              <option value="INVITE_ONLY">Invite Only</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Description (Optional)</label>
            <Input
              placeholder="Geographic origin, historical notes..."
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
