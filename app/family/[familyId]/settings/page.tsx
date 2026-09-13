"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, Users, Shield, Mail, Trash2, CheckCircle2 } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { Family } from "@/types";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

export default function FamilySettingsPage() {
  const params = useParams();
  const router = useRouter();
  const familyId = params.familyId as string;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("EDITOR");

  // Family details form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState<"PUBLIC" | "PRIVATE" | "INVITE_ONLY">("PRIVATE");

  // Delete family state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [confirmFamilyName, setConfirmFamilyName] = useState("");

  const { data: family, isLoading } = useQuery<Family>({
    queryKey: ["family", familyId],
    queryFn: () => apiRequest<Family>(`/families/${familyId}/`),
  });

  const { data: memberships } = useQuery<any[]>({
    queryKey: ["family-memberships", familyId],
    queryFn: () => apiRequest<any[]>(`/families/${familyId}/memberships/`),
  });

  useEffect(() => {
    if (family) {
      setName(family.name);
      setDescription(family.description || "");
      setPrivacy(family.privacy);
    }
  }, [family]);

  const updateFamilyMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest(`/families/${familyId}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family", familyId] });
      queryClient.invalidateQueries({ queryKey: ["families"] });
      toast({ title: "Family Updated", description: "Settings saved successfully." });
    },
  });

  const deleteFamilyMutation = useMutation({
    mutationFn: () =>
      apiRequest(`/families/${familyId}/`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["families"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast({
        title: "Family Deleted (परिवार हटाइयो)",
        description: `Successfully deleted "${family?.name}".`,
        type: "info",
      });
      router.push("/dashboard");
    },
    onError: (err: any) => {
      toast({
        title: "Delete Failed",
        description: err?.message || "Could not delete family tree.",
        type: "error",
      });
    },
  });

  const inviteUserMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest("/invitations/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (res) => {
      setInviteModalOpen(false);
      setInviteEmail("");
      toast({
        title: "Invitation Created",
        description: `Token: ${res.token} (Share this with ${res.email})`,
      });
    },
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateFamilyMutation.mutate({ name, description, privacy });
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    inviteUserMutation.mutate({
      family: familyId,
      email: inviteEmail,
      role: inviteRole,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar familyId={familyId} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-8">
          <div className="border-b border-border pb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
              Family Settings & Access Control
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure privacy, permissions, and member roles for {family?.name || "this family"}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* General Info */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-4 w-4 text-primary" />
                  Lineage Configuration
                </CardTitle>
                <CardDescription>Adjust name, summary, and discovery rules.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Family Name</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Privacy Mode</label>
                    <select
                      value={privacy}
                      onChange={(e) => setPrivacy(e.target.value as any)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none"
                    >
                      <option value="PRIVATE">Private (Restricted to members)</option>
                      <option value="PUBLIC">Public (Visible globally)</option>
                      <option value="INVITE_ONLY">Invite Only (Unlisted)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Description</label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground outline-none"
                    />
                  </div>

                  <Button type="submit" disabled={updateFamilyMutation.isPending} className="w-full text-xs">
                    {updateFamilyMutation.isPending ? "Saving..." : "Save Settings"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Memberships & Roles */}
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Family Members
                  </CardTitle>
                  <CardDescription>Users authorized to view or edit this tree.</CardDescription>
                </div>
                <Button size="sm" onClick={() => setInviteModalOpen(true)} className="text-xs gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  Invite
                </Button>
              </CardHeader>

              <CardContent className="space-y-3 pt-3">
                <div className="divide-y divide-border border border-border rounded-lg bg-card">
                  {memberships && memberships.length > 0 ? (
                    memberships.map((m: any) => (
                      <div key={m.id} className="p-3 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-foreground">{m.user.full_name || m.user.email}</div>
                          <div className="text-[11px] text-muted-foreground">{m.user.email}</div>
                        </div>
                        <Badge variant="outline">{m.role}</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      Only owner is currently assigned.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Danger Zone */}
          <Card className="border-destructive/30 bg-destructive/5 mt-6">
            <CardHeader>
              <CardTitle className="text-lg text-destructive flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Danger Zone (जोखिमपूर्ण क्षेत्र)
              </CardTitle>
              <CardDescription>
                Permanently delete this family tree and all associated genealogy data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Once deleted, all member profiles, lineage connections, stories, media, and timeline events will be permanently removed. This action cannot be reversed.
              </p>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteConfirmOpen(true)}
                className="gap-2 text-xs"
              >
                <Trash2 className="h-4 w-4" />
                Delete Family Tree (यो परिवार पूर्ण रूपमा हटाउनुहोस्)
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Delete Family Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setConfirmFamilyName("");
        }}
        title="Delete Family Tree (परिवार हटाउने पुष्टि)"
        description={`Are you sure you want to delete "${family?.name}"?`}
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs space-y-1">
            <p className="font-semibold">⚠️ Warning: Irreversible Action</p>
            <p>
              Deleting this family tree will immediately remove all member nodes, generational links, marriages, stories, and uploaded media associated with it.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Please type <span className="font-bold text-foreground">{family?.name}</span> to confirm:
            </label>
            <Input
              value={confirmFamilyName}
              onChange={(e) => setConfirmFamilyName(e.target.value)}
              placeholder={family?.name}
              className="text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setConfirmFamilyName("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={confirmFamilyName !== family?.name || deleteFamilyMutation.isPending}
              onClick={() => deleteFamilyMutation.mutate()}
            >
              {deleteFamilyMutation.isPending ? "Deleting..." : "Delete Permanently"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Invite Member Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite Family Member"
        description="Grant a user access to this family tree."
      >
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Email Address</label>
            <Input
              type="email"
              required
              placeholder="relative@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Assigned Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none"
            >
              <option value="VIEWER">Viewer (Read-only access)</option>
              <option value="EDITOR">Editor (Can add/edit people & stories)</option>
              <option value="ADMIN">Admin (Can manage settings and invite others)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={inviteUserMutation.isPending}>
              {inviteUserMutation.isPending ? "Generating..." : "Generate Invitation"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
