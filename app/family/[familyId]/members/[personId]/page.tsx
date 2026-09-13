"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  User,
  TreePine,
  ArrowLeft,
  Calendar,
  MapPin,
  Briefcase,
  Heart,
  Baby,
  Users as UsersIcon,
  BookOpen,
  Image as ImageIcon,
  Pencil,
  Trash2,
  Shield,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import { Person, EventItem, Story, MediaItem } from "@/types";
import { resolvePhotoUrl } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import EditPersonModal from "@/features/tree/EditPersonModal";

export default function StandalonePersonProfilePage() {
  const params = useParams();
  const router = useRouter();
  const familyId = params.familyId as string;
  const personId = params.personId as string;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const { data: person, isLoading: personLoading } = useQuery<Person>({
    queryKey: ["person-standalone", personId],
    queryFn: () => apiRequest<Person>(`/people/${personId}/`),
  });

  const { data: eventsData } = useQuery<{ results: EventItem[] }>({
    queryKey: ["person-events", personId],
    queryFn: () => apiRequest<{ results: EventItem[] }>(`/events/?person=${personId}`),
  });

  const { data: storiesData } = useQuery<{ results: Story[] }>({
    queryKey: ["person-stories", personId],
    queryFn: () => apiRequest<{ results: Story[] }>(`/stories/?person=${personId}`),
  });

  const { data: mediaData } = useQuery<{ results: MediaItem[] }>({
    queryKey: ["person-media", personId],
    queryFn: () => apiRequest<{ results: MediaItem[] }>(`/media/?person=${personId}`),
  });

  const events = eventsData?.results || [];
  const stories = storiesData?.results || [];
  const media = mediaData?.results || [];

  if (personLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading person profile...</p>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <p className="text-base font-semibold">Person not found.</p>
        <Link href={`/family/${familyId}/members`} className="mt-4">
          <Button variant="outline">Back to Members</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar familyId={familyId} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-8">
          {/* Back button */}
          <div>
            <Link
              href={`/family/${familyId}/members`}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Member List
            </Link>
          </div>

          {/* Person Header Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 rounded-2xl border border-border bg-card shadow-sm">
            <div className="h-24 w-24 rounded-2xl overflow-hidden bg-secondary border border-border shrink-0 flex items-center justify-center font-bold text-3xl text-primary shadow-xs">
              {person.profile_photo ? (
                <img src={resolvePhotoUrl(person.profile_photo)} alt={person.full_name} className="h-full w-full object-cover" />
              ) : (
                <span>{person.first_name[0]}{person.last_name?.[0] || ""}</span>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground font-serif">
                  {person.full_name}
                </h1>
                <Badge variant={person.is_living ? "success" : "secondary"}>
                  {person.is_living ? "Living" : "Deceased"}
                </Badge>
                <Badge variant="outline">{person.gender}</Badge>
                <Badge
                  variant={person.privacy === "PUBLIC" ? "outline" : "secondary"}
                  className="gap-1 text-[11px]"
                >
                  <Shield className="h-3 w-3 text-primary" />
                  {person.privacy === "PUBLIC" ? "Public (सार्वजनिक)" : "Private (व्यक्तिगत)"}
                </Badge>
              </div>

              <p className="text-sm font-semibold text-primary">{person.lifespan}</p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                {person.birth_place && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    Born: {person.birth_place}
                  </span>
                )}
                {person.death_place && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-rose-500" />
                    Died: {person.death_place}
                  </span>
                )}
                {person.occupation && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5 text-primary" />
                    {person.occupation}
                  </span>
                )}
              </div>
            </div>

            <div className="shrink-0 flex flex-wrap sm:flex-col gap-2 pt-2 sm:pt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditModalOpen(true)}
                className="gap-1.5 text-xs font-medium border-primary/40 hover:bg-primary/10 hover:text-primary"
              >
                <Pencil className="h-3.5 w-3.5 text-primary" />
                सम्पादन (Edit Details)
              </Button>
              <Link href={`/family/${familyId}/tree`}>
                <Button className="gap-2 text-xs w-full" size="sm">
                  <TreePine className="h-4 w-4" />
                  View in Tree
                </Button>
              </Link>
            </div>
          </div>

          {/* Biography */}
          {person.biography && (
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-serif">Biography & Life Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                  {person.biography}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Family Relationships */}
          {person.relatives && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold tracking-tight text-foreground font-serif">
                Family Relationships
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Parents */}
                <Card className="border-border">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <UsersIcon className="h-4 w-4 text-primary" />
                      Parents ({person.relatives.parents.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-1.5">
                    {person.relatives.parents.map((p) => (
                      <Link
                        key={p.id}
                        href={`/family/${familyId}/members/${p.id}`}
                        className="block p-2 rounded-md hover:bg-muted text-xs transition-colors"
                      >
                        <div className="font-semibold text-foreground">{p.full_name}</div>
                        <div className="text-[11px] text-muted-foreground">{p.lifespan}</div>
                      </Link>
                    ))}
                    {person.relatives.parents.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">No parents recorded</p>
                    )}
                  </CardContent>
                </Card>

                {/* Spouses */}
                <Card className="border-border">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Heart className="h-4 w-4 text-pink-500" />
                      Spouse / Partner ({person.relatives.spouses.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-1.5">
                    {person.relatives.spouses.map((s) => (
                      <Link
                        key={s.id}
                        href={`/family/${familyId}/members/${s.id}`}
                        className="block p-2 rounded-md hover:bg-muted text-xs transition-colors"
                      >
                        <div className="font-semibold text-foreground">{s.full_name}</div>
                        <div className="text-[11px] text-muted-foreground">{s.lifespan}</div>
                      </Link>
                    ))}
                    {person.relatives.spouses.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">No spouse recorded</p>
                    )}
                  </CardContent>
                </Card>

                {/* Children */}
                <Card className="border-border">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Baby className="h-4 w-4 text-emerald-500" />
                      Children ({person.relatives.children.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-1.5">
                    {person.relatives.children.map((c) => (
                      <Link
                        key={c.id}
                        href={`/family/${familyId}/members/${c.id}`}
                        className="block p-2 rounded-md hover:bg-muted text-xs transition-colors"
                      >
                        <div className="font-semibold text-foreground">{c.full_name}</div>
                        <div className="text-[11px] text-muted-foreground">{c.lifespan}</div>
                      </Link>
                    ))}
                    {person.relatives.children.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">No children recorded</p>
                    )}
                  </CardContent>
                </Card>

                {/* Siblings */}
                <Card className="border-border">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <UsersIcon className="h-4 w-4 text-amber-500" />
                      Siblings ({person.relatives.siblings.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-1.5">
                    {person.relatives.siblings.map((sib) => (
                      <Link
                        key={sib.id}
                        href={`/family/${familyId}/members/${sib.id}`}
                        className="block p-2 rounded-md hover:bg-muted text-xs transition-colors"
                      >
                        <div className="font-semibold text-foreground">{sib.full_name}</div>
                        <div className="text-[11px] text-muted-foreground">{sib.lifespan}</div>
                      </Link>
                    ))}
                    {person.relatives.siblings.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">No siblings recorded</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Chronological Life Timeline */}
          {events.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold tracking-tight text-foreground font-serif">
                Life Events & Milestones
              </h2>
              <div className="divide-y divide-border border border-border rounded-xl bg-card">
                {events.map((ev) => (
                  <div key={ev.id} className="p-4 flex items-start justify-between gap-4 text-sm">
                    <div>
                      <div className="font-semibold text-foreground">{ev.title}</div>
                      {ev.place && <div className="text-xs text-muted-foreground mt-0.5">Location: {ev.place}</div>}
                      {ev.description && <div className="text-xs text-foreground/80 mt-1">{ev.description}</div>}
                    </div>
                    <Badge variant="outline">{ev.date ? new Date(ev.date).toLocaleDateString() : ev.date_text}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Associated Stories */}
          {stories.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold tracking-tight text-foreground font-serif">
                Featured Stories & Memories
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stories.map((story) => (
                  <Card key={story.id} className="border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-serif">{story.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {story.content.replace(/[#*`>]/g, "")}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Edit / Delete Person Modal */}
          <EditPersonModal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            person={person}
            familyId={familyId}
            onDeleteSuccess={() => {
              router.push(`/family/${familyId}/members`);
            }}
          />
        </main>
      </div>
    </div>
  );
}
