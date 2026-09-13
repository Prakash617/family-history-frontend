"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Plus, MapPin, Tag, Flag } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { EventItem, Person } from "@/types";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function FamilyEventsPage() {
  const params = useParams();
  const familyId = params.familyId as string;
  const queryClient = useQueryClient();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("BIRTH");
  const [date, setDate] = useState("");
  const [place, setPlace] = useState("");
  const [description, setDescription] = useState("");
  const [personId, setPersonId] = useState("");

  const { data: eventsData, isLoading } = useQuery<{ results: EventItem[] }>({
    queryKey: ["family-events", familyId],
    queryFn: () => apiRequest<{ results: EventItem[] }>(`/events/?family=${familyId}`),
  });

  const { data: peopleData } = useQuery<{ results: Person[] }>({
    queryKey: ["family-people", familyId],
    queryFn: () => apiRequest<{ results: Person[] }>(`/people/?family=${familyId}`),
  });

  const events = eventsData?.results || [];
  const people = peopleData?.results || [];

  const createEventMutation = useMutation({
    mutationFn: (newEvent: any) =>
      apiRequest<EventItem>("/events/", {
        method: "POST",
        body: JSON.stringify(newEvent),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family-events", familyId] });
      setAddModalOpen(false);
      setTitle("");
      setDate("");
      setPlace("");
      setDescription("");
      setPersonId("");
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createEventMutation.mutate({
      family: familyId,
      title,
      event_type: eventType,
      date: date || null,
      place,
      description,
      person: personId || null,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar familyId={familyId} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
                Chronological Timeline & Events
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Historical timeline of births, marriages, career achievements, and migrations.
              </p>
            </div>

            <Button onClick={() => setAddModalOpen(true)} className="gap-1.5 text-xs">
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          </div>

          {/* Timeline visualization */}
          {isLoading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">Loading timeline events...</div>
          ) : events.length === 0 ? (
            <Card className="border-dashed border-2 border-border p-12 text-center space-y-3">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="font-semibold text-lg text-foreground">No timeline events recorded</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Record family births, marriages, graduations, or migrations to build a chronological timeline.
              </p>
              <Button onClick={() => setAddModalOpen(true)}>Add Event</Button>
            </Card>
          ) : (
            <div className="relative border-l-2 border-border ml-4 sm:ml-6 space-y-8 py-4">
              {events.map((ev) => (
                <div key={ev.id} className="relative pl-6 sm:pl-8 group">
                  {/* Timeline node icon */}
                  <div className="absolute -left-3 top-1 h-6 w-6 rounded-full border-2 border-primary bg-background flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-xs">
                    <Flag className="h-3 w-3" />
                  </div>

                  <Card className="border-border hover:shadow-md transition-shadow">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Badge variant="outline">{ev.event_type}</Badge>
                        <span className="text-xs font-semibold text-primary">
                          {ev.date ? new Date(ev.date).toLocaleDateString() : ev.date_text || "Undated"}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-foreground font-serif">{ev.title}</h3>

                      {ev.place && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          <span>{ev.place}</span>
                        </div>
                      )}

                      {ev.person_detail && (
                        <div className="text-xs text-muted-foreground">
                          Associated with: <span className="font-medium text-foreground">{ev.person_detail.full_name}</span>
                        </div>
                      )}

                      {ev.description && (
                        <p className="text-xs text-foreground/80 pt-1 leading-relaxed border-t border-border">
                          {ev.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Add Event Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Record Historical Event"
        description="Add a milestone to the family chronicle."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Title</label>
            <Input
              required
              placeholder="e.g. Graduation from Medical School"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Event Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none"
              >
                <option value="BIRTH">Birth</option>
                <option value="MARRIAGE">Marriage</option>
                <option value="DEATH">Death</option>
                <option value="EDUCATION">Education / Graduation</option>
                <option value="MIGRATION">Migration / Relocation</option>
                <option value="CAREER">Career / Business</option>
                <option value="MILITARY">Military Service</option>
                <option value="OTHER">Other Milestone</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Date (Optional)</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Location</label>
              <Input placeholder="e.g. Kathmandu, Nepal" value={place} onChange={(e) => setPlace(e.target.value)} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Associated Person</label>
              <select
                value={personId}
                onChange={(e) => setPersonId(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none"
              >
                <option value="">None / Whole Family</option>
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <textarea
              rows={3}
              placeholder="Notes or context about this milestone..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createEventMutation.isPending}>
              {createEventMutation.isPending ? "Recording..." : "Record Event"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
