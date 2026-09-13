"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Search,
  Plus,
  TreePine,
  Filter,
  MapPin,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import { Person } from "@/types";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/dialog";
import PersonDrawer from "@/features/tree/PersonDrawer";

export default function FamilyMembersPage() {
  const params = useParams();
  const familyId = params.familyId as string;
  const queryClient = useQueryClient();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("ALL");
  const [livingFilter, setLivingFilter] = useState("ALL");
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  // Add Member Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER">("MALE");
  const [birthYearApprox, setBirthYearApprox] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [occupation, setOccupation] = useState("");
  const [isLiving, setIsLiving] = useState(true);
  const [biography, setBiography] = useState("");

  const { data: peopleData, isLoading } = useQuery<{ results: Person[] }>({
    queryKey: ["family-people", familyId],
    queryFn: () => apiRequest<{ results: Person[] }>(`/people/?family=${familyId}`),
  });

  const people = peopleData?.results || [];

  const filteredPeople = people.filter((p) => {
    const matchesSearch =
      p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.birth_place && p.birth_place.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.occupation && p.occupation.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGender = genderFilter === "ALL" || p.gender === genderFilter;
    const matchesLiving =
      livingFilter === "ALL" ||
      (livingFilter === "LIVING" && p.is_living) ||
      (livingFilter === "DECEASED" && !p.is_living);

    return matchesSearch && matchesGender && matchesLiving;
  });

  const createPersonMutation = useMutation({
    mutationFn: (newPersonData: any) =>
      apiRequest<Person>("/people/", {
        method: "POST",
        body: JSON.stringify(newPersonData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family-people", familyId] });
      queryClient.invalidateQueries({ queryKey: ["family-tree", familyId] });
      setAddModalOpen(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setBirthYearApprox("");
    setBirthPlace("");
    setOccupation("");
    setBiography("");
    setIsLiving(true);
  };

  const handleCreatePerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) return;

    createPersonMutation.mutate({
      family: familyId,
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      gender,
      birth_year_approx: birthYearApprox,
      birth_place: birthPlace,
      occupation,
      biography,
      is_living: isLiving,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar familyId={familyId} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Top Title & Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
                People & Members
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage individuals, ancestors, and biographical records in this family.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link href={`/family/${familyId}/tree`}>
                <Button variant="outline" className="gap-1.5 text-xs">
                  <TreePine className="h-4 w-4" />
                  View in Tree
                </Button>
              </Link>
              <Button onClick={() => setAddModalOpen(true)} className="gap-1.5 text-xs">
                <Plus className="h-4 w-4" />
                Add Person
              </Button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 bg-card p-3 rounded-xl border border-border">
            <div className="relative flex-1 min-w-[200px]">
              <Input
                placeholder="Search by name, place, occupation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>

            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground outline-none"
            >
              <option value="ALL">All Genders</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>

            <select
              value={livingFilter}
              onChange={(e) => setLivingFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="LIVING">Living Only</option>
              <option value="DECEASED">Deceased Only</option>
            </select>
          </div>

          {/* People Grid */}
          {isLoading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">Loading members...</div>
          ) : filteredPeople.length === 0 ? (
            <Card className="border-dashed border-2 border-border p-12 text-center space-y-3">
              <Users className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="font-semibold text-lg text-foreground">No people found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                No individuals matched your filter criteria or this family is empty.
              </p>
              <Button onClick={() => setAddModalOpen(true)}>Add New Person</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPeople.map((person) => (
                <Card
                  key={person.id}
                  onClick={() => setSelectedPersonId(person.id)}
                  className="border-border hover:border-primary/50 hover:shadow-md transition-all cursor-pointer select-none"
                >
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-secondary border border-border shrink-0 flex items-center justify-center font-bold text-primary">
                      {person.profile_photo ? (
                        <img src={person.profile_photo} alt={person.full_name} className="h-full w-full object-cover" />
                      ) : (
                        <span>{person.first_name[0]}{person.last_name?.[0] || ""}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-semibold text-sm text-foreground truncate">{person.full_name}</h4>
                        <Badge variant={person.is_living ? "success" : "secondary"} className="text-[10px] px-1.5 py-0">
                          {person.is_living ? "Living" : "Deceased"}
                        </Badge>
                      </div>

                      <p className="text-xs font-medium text-primary mt-0.5">{person.lifespan}</p>

                      {person.birth_place && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1 truncate">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{person.birth_place}</span>
                        </div>
                      )}

                      {person.occupation && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5 truncate">
                          <Briefcase className="h-3 w-3 shrink-0" />
                          <span className="truncate">{person.occupation}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Person Detail Drawer */}
      <PersonDrawer
        personId={selectedPersonId}
        onClose={() => setSelectedPersonId(null)}
        onSelectPerson={(id) => setSelectedPersonId(id)}
        onQuickAdd={() => {}}
      />

      {/* Add Person Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Family Member"
        description="Record a new ancestor or living relative in this lineage."
      >
        <form onSubmit={handleCreatePerson} className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">First Name</label>
              <Input required placeholder="First" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Middle Name</label>
              <Input placeholder="Middle" value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Last Name</label>
              <Input placeholder="Last" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
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
                placeholder="e.g. 1965 or circa 1920"
                value={birthYearApprox}
                onChange={(e) => setBirthYearApprox(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Birth Place</label>
              <Input
                placeholder="e.g. Kathmandu, Nepal"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Occupation</label>
              <Input
                placeholder="e.g. Architect"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is-living"
              checked={isLiving}
              onChange={(e) => setIsLiving(e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
            <label htmlFor="is-living" className="text-sm font-medium text-foreground cursor-pointer">
              Person is currently living
            </label>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Biography / Notes</label>
            <textarea
              rows={3}
              placeholder="Life summary, notable achievements, memories..."
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createPersonMutation.isPending}>
              {createPersonMutation.isPending ? "Saving..." : "Save Person"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
