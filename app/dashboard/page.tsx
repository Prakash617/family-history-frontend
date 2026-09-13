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
  UserPlus,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Family, Person } from "@/types";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState("");
  const [newFamilyDesc, setNewFamilyDesc] = useState("");
  const [newFamilyPrivacy, setNewFamilyPrivacy] = useState<"PUBLIC" | "PRIVATE" | "INVITE_ONLY">("PRIVATE");

  // Add Member Modal State
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [selectedFamilyIdForMember, setSelectedFamilyIdForMember] = useState<string>("");
  const [memberFirstName, setMemberFirstName] = useState("");
  const [memberMiddleName, setMemberMiddleName] = useState("");
  const [memberLastName, setMemberLastName] = useState("");
  const [memberGender, setMemberGender] = useState<"MALE" | "FEMALE" | "OTHER">("MALE");
  const [memberBirthYearApprox, setMemberBirthYearApprox] = useState("");
  const [memberBirthPlace, setMemberBirthPlace] = useState("");
  const [memberOccupation, setMemberOccupation] = useState("");
  const [memberIsLiving, setMemberIsLiving] = useState(true);
  const [memberBiography, setMemberBiography] = useState("");
  const [memberRelationType, setMemberRelationType] = useState<"NONE" | "CHILD_OF" | "SPOUSE_OF" | "PARENT_OF">("NONE");
  const [memberRelatedPersonId, setMemberRelatedPersonId] = useState("");
  const [memberFormError, setMemberFormError] = useState<string | null>(null);

  const { data: familiesData, isLoading: familiesLoading } = useQuery({
    queryKey: ["families"],
    queryFn: () => apiRequest<{ results: Family[] }>("/families/"),
  });

  const families = familiesData?.results || [];
  const primaryFamily = families[0];

  // Auto-set selected family for member if not set
  React.useEffect(() => {
    if (!selectedFamilyIdForMember && primaryFamily) {
      setSelectedFamilyIdForMember(primaryFamily.id);
    }
  }, [selectedFamilyIdForMember, primaryFamily]);

  // Query people for the family selected in the Add Member modal
  const activeModalFamilyId = selectedFamilyIdForMember || primaryFamily?.id || "";
  const { data: modalFamilyPeopleData } = useQuery<{ results: Person[] }>({
    queryKey: ["family-people", activeModalFamilyId],
    queryFn: () => apiRequest<{ results: Person[] }>(`/people/?family=${activeModalFamilyId}`),
    enabled: !!activeModalFamilyId && addMemberModalOpen,
  });
  const modalFamilyPeople = modalFamilyPeopleData?.results || [];

  const { data: dashboardStats } = useQuery({
    queryKey: ["family-dashboard", primaryFamily?.id],
    queryFn: () => apiRequest<any>(`/families/${primaryFamily.id}/dashboard/`),
    enabled: !!primaryFamily?.id && isAuthenticated,
  });

  const createFamilyMutation = useMutation({
    mutationFn: (data: { name: string; description: string; privacy: string }) =>
      apiRequest<Family>("/families/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (newFamily) => {
      queryClient.invalidateQueries({ queryKey: ["families"] });
      setCreateModalOpen(false);
      setNewFamilyName("");
      setNewFamilyDesc("");
      setNewFamilyPrivacy("PRIVATE");
      toast({
        title: "Family Created (परिवार सिर्जना भयो)",
        description: `Successfully created ${newFamily.name} (${newFamily.privacy})`,
        type: "success",
      });
      router.push(`/family/${newFamily.id}/tree`);
    },
  });

  const handleCreateFamily = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyName.trim()) return;
    createFamilyMutation.mutate({
      name: newFamilyName,
      description: newFamilyDesc,
      privacy: newFamilyPrivacy,
    });
  };

  const resetMemberForm = () => {
    setMemberFirstName("");
    setMemberMiddleName("");
    setMemberLastName("");
    setMemberBirthYearApprox("");
    setMemberBirthPlace("");
    setMemberOccupation("");
    setMemberBiography("");
    setMemberIsLiving(true);
    setMemberRelationType("NONE");
    setMemberRelatedPersonId("");
    setMemberFormError(null);
  };

  const addMemberMutation = useMutation({
    mutationFn: async () => {
      const famId = selectedFamilyIdForMember || primaryFamily?.id;
      if (!famId) throw new Error("Please select or create a family tree first.");

      // 1. Create Person
      const newPerson = await apiRequest<Person>("/people/", {
        method: "POST",
        body: JSON.stringify({
          family: famId,
          first_name: memberFirstName,
          middle_name: memberMiddleName,
          last_name: memberLastName,
          gender: memberGender,
          birth_year_approx: memberBirthYearApprox,
          birth_place: memberBirthPlace,
          occupation: memberOccupation,
          biography: memberBiography,
          is_living: memberIsLiving,
        }),
      });

      // 2. Create relationship if specified
      if (memberRelationType === "CHILD_OF" && memberRelatedPersonId) {
        await apiRequest("/relationships/", {
          method: "POST",
          body: JSON.stringify({
            family: famId,
            person_a: memberRelatedPersonId,
            person_b: newPerson.id,
            relationship_type: "PARENT_CHILD",
            relationship_subtype: "BIOLOGICAL",
          }),
        });
      } else if (memberRelationType === "PARENT_OF" && memberRelatedPersonId) {
        await apiRequest("/relationships/", {
          method: "POST",
          body: JSON.stringify({
            family: famId,
            person_a: newPerson.id,
            person_b: memberRelatedPersonId,
            relationship_type: "PARENT_CHILD",
            relationship_subtype: "BIOLOGICAL",
          }),
        });
      } else if (memberRelationType === "SPOUSE_OF" && memberRelatedPersonId) {
        await apiRequest("/marriages/", {
          method: "POST",
          body: JSON.stringify({
            family: famId,
            partner_1: memberRelatedPersonId,
            partner_2: newPerson.id,
            partnership_type: "MARRIAGE",
            end_reason: "ONGOING",
          }),
        });
        await apiRequest("/relationships/", {
          method: "POST",
          body: JSON.stringify({
            family: famId,
            person_a: memberRelatedPersonId,
            person_b: newPerson.id,
            relationship_type: "SPOUSE",
          }),
        });
      }

      return newPerson;
    },
    onSuccess: (newPerson) => {
      queryClient.invalidateQueries({ queryKey: ["families"] });
      queryClient.invalidateQueries({ queryKey: ["family-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["family-people"] });
      queryClient.invalidateQueries({ queryKey: ["family-tree"] });
      setAddMemberModalOpen(false);
      resetMemberForm();
      toast({
        title: "Member Added (सदस्य थपियो)",
        description: `${newPerson.full_name} has been added successfully.`,
        type: "success",
      });
    },
    onError: (err: any) => {
      setMemberFormError(err?.message || "Failed to add member.");
      toast({
        title: "Error",
        description: err?.message || "Could not add family member.",
        type: "error",
      });
    },
  });

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    setMemberFormError(null);
    if (!memberFirstName.trim()) {
      setMemberFormError("First name is required.");
      return;
    }
    if (memberRelationType !== "NONE" && !memberRelatedPersonId) {
      setMemberFormError("Please select the related family member.");
      return;
    }
    addMemberMutation.mutate();
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
              {families.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedFamilyIdForMember(primaryFamily?.id || families[0]?.id);
                    setAddMemberModalOpen(true);
                  }}
                  className="gap-2 shadow-xs border-primary/30 text-primary hover:bg-primary/10 font-medium"
                >
                  <UserPlus className="h-4 w-4" />
                  Add Member (सदस्य थप्नुहोस्)
                </Button>
              )}
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
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs gap-1 text-primary hover:bg-primary/10 font-medium"
                          onClick={() => {
                            setSelectedFamilyIdForMember(fam.id);
                            setAddMemberModalOpen(true);
                          }}
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                          Add Member
                        </Button>
                        <Link href={`/family/${fam.id}/members`}>
                          <Button size="sm" variant="ghost" className="text-xs">
                            Members
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
        title="Create New Family (नयाँ परिवार सिर्जना गर्नुहोस्)"
        description="Establish a new ancestral lineage container to start mapping relatives."
      >
        <form onSubmit={handleCreateFamily} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Family Name * (परिवारको नाम)</label>
            <Input
              required
              placeholder="e.g. थापा परिवार वंशावली or Smith-Johnson Family"
              value={newFamilyName}
              onChange={(e) => setNewFamilyName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Visibility & Privacy (गोपनीयता छनौट)</label>
            <select
              value={newFamilyPrivacy}
              onChange={(e) => setNewFamilyPrivacy(e.target.value as any)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm text-foreground outline-none font-medium"
            >
              <option value="PRIVATE">🔒 Private (गोप्य) — Only invited members can view or edit</option>
              <option value="PUBLIC">🌐 Public (सार्वजनिक) — Anyone with the link can view historical lineage</option>
              <option value="INVITE_ONLY">✉️ Invite Only (निमन्त्रणा मात्र) — Strictly restricted to invited members</option>
            </select>
            <p className="text-[11px] text-muted-foreground">
              {newFamilyPrivacy === "PUBLIC"
                ? "Public trees can be explored by anyone with the link, perfect for published clan genealogies."
                : newFamilyPrivacy === "PRIVATE"
                ? "Private trees are strictly protected; only you and members you invite can see names and relatives."
                : "Invite-only trees require secure invitation tokens to access."}
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Description & History (विवरण तथा पुर्ख्यौली पृष्ठभूमि)</label>
            <textarea
              rows={3}
              placeholder="e.g. Origin from Lamjung, Nepal. Ancestral lineage spanning 6 generations..."
              value={newFamilyDesc}
              onChange={(e) => setNewFamilyDesc(e.target.value)}
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
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

      {/* Add Member Modal */}
      <Modal
        isOpen={addMemberModalOpen}
        onClose={() => setAddMemberModalOpen(false)}
        title="Add Family Member (नयाँ सदस्य थप्नुहोस्)"
        description="Record an ancestor or living relative and optionally connect them into the tree."
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          {memberFormError && (
            <div className="p-2.5 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs font-medium">
              {memberFormError}
            </div>
          )}

          {/* Family Selection (if multiple families exist) */}
          {families.length > 1 && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Select Family Tree (परिवार छान्नुहोस्)</label>
              <select
                value={selectedFamilyIdForMember}
                onChange={(e) => {
                  setSelectedFamilyIdForMember(e.target.value);
                  setMemberRelatedPersonId("");
                }}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground outline-none font-medium"
              >
                {families.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.members_count} members)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">First Name *</label>
              <Input
                required
                placeholder="First"
                value={memberFirstName}
                onChange={(e) => setMemberFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Middle Name</label>
              <Input
                placeholder="Middle"
                value={memberMiddleName}
                onChange={(e) => setMemberMiddleName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Last Name</label>
              <Input
                placeholder="Last"
                value={memberLastName}
                onChange={(e) => setMemberLastName(e.target.value)}
              />
            </div>
          </div>

          {/* Genealogical Tree Connection */}
          {modalFamilyPeople.length > 0 && (
            <div className="space-y-2 p-3 rounded-lg border border-primary/20 bg-primary/5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-primary">
                  Connect to Family Tree (पारिवारिक सम्बन्ध जोड्नुहोस्)
                </label>
                <span className="text-[11px] text-muted-foreground">ऐच्छिक (Optional)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1">सम्बन्ध प्रकार (Type)</label>
                  <select
                    value={memberRelationType}
                    onChange={(e) => setMemberRelationType(e.target.value as any)}
                    className="h-9 w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground outline-none"
                  >
                    <option value="NONE">Standalone / New Root (नयाँ पुर्खा)</option>
                    <option value="CHILD_OF">Child of (को सन्तान)</option>
                    <option value="SPOUSE_OF">Spouse of (को जीवनसाथी)</option>
                    <option value="PARENT_OF">Parent of (को बुबा/आमा)</option>
                  </select>
                </div>
                {memberRelationType !== "NONE" && (
                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-1">सदस्य छान्नुहोस् (Relative)</label>
                    <select
                      value={memberRelatedPersonId}
                      onChange={(e) => setMemberRelatedPersonId(e.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground outline-none font-medium"
                    >
                      <option value="">-- सदस्य छान्नुहोस् --</option>
                      {modalFamilyPeople.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.full_name} ({p.gender === "FEMALE" ? "Female" : "Male"})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Gender</label>
              <select
                value={memberGender}
                onChange={(e) => setMemberGender(e.target.value as any)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Birth Year (or Approx)</label>
              <Input
                placeholder="e.g. 1970 or circa 1930"
                value={memberBirthYearApprox}
                onChange={(e) => setMemberBirthYearApprox(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Birth Place</label>
              <Input
                placeholder="e.g. Kathmandu, Nepal"
                value={memberBirthPlace}
                onChange={(e) => setMemberBirthPlace(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Occupation</label>
              <Input
                placeholder="e.g. Teacher, Engineer"
                value={memberOccupation}
                onChange={(e) => setMemberOccupation(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="member-is-living"
              checked={memberIsLiving}
              onChange={(e) => setMemberIsLiving(e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
            <label htmlFor="member-is-living" className="text-sm font-medium text-foreground cursor-pointer">
              Person is currently living
            </label>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Biography / Notes</label>
            <textarea
              rows={2}
              placeholder="Life summary, notable achievements, memories..."
              value={memberBiography}
              onChange={(e) => setMemberBiography(e.target.value)}
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setAddMemberModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addMemberMutation.isPending}>
              {addMemberMutation.isPending ? "Adding..." : "Add Member"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
