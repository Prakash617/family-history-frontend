"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { User, Heart, Baby, Users as UsersIcon, MapPin, Briefcase, Plus, ExternalLink } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { Person } from "@/types";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PersonDrawerProps {
  personId: string | null;
  onClose: () => void;
  onSelectPerson: (id: string) => void;
  onQuickAdd: (relationType: "CHILD" | "SPOUSE" | "PARENT", person: Person) => void;
}

export default function PersonDrawer({
  personId,
  onClose,
  onSelectPerson,
  onQuickAdd,
}: PersonDrawerProps) {
  const { data: person, isLoading } = useQuery<Person>({
    queryKey: ["person-detail", personId],
    queryFn: () => apiRequest<Person>(`/people/${personId}/`),
    enabled: !!personId,
  });

  return (
    <Drawer isOpen={!!personId} onClose={onClose} title="Person Profile">
      {isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading details...</div>
      ) : person ? (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="flex items-start gap-4 pb-4 border-b border-border">
            <div className="h-16 w-16 rounded-xl overflow-hidden bg-secondary border border-border shrink-0 flex items-center justify-center font-bold text-xl text-primary">
              {person.profile_photo ? (
                <img src={person.profile_photo} alt={person.full_name} className="h-full w-full object-cover" />
              ) : (
                <span>{person.first_name[0]}{person.last_name?.[0] || ""}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-foreground font-serif truncate">{person.full_name}</h3>
              </div>
              <p className="text-xs font-semibold text-primary mt-0.5">{person.lifespan}</p>

              <div className="flex items-center gap-2 mt-2">
                <Badge variant={person.is_living ? "success" : "secondary"}>
                  {person.is_living ? "Living" : "Deceased"}
                </Badge>
                <Badge variant="outline">{person.gender}</Badge>
              </div>
            </div>
          </div>

          {/* Quick Add Relative Actions */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Quick Actions
            </label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1"
                onClick={() => onQuickAdd("CHILD", person)}
              >
                <Baby className="h-3.5 w-3.5" />
                Add Child
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1"
                onClick={() => onQuickAdd("SPOUSE", person)}
              >
                <Heart className="h-3.5 w-3.5" />
                Add Spouse
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1"
                onClick={() => onQuickAdd("PARENT", person)}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Parent
              </Button>
            </div>
          </div>

          {/* Vital Details */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Life & Vitals
            </label>
            <div className="space-y-1.5 rounded-lg border border-border bg-secondary/30 p-3 text-xs">
              {person.birth_place && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span>Born in: {person.birth_place}</span>
                </div>
              )}
              {person.death_place && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-rose-500" />
                  <span>Died in: {person.death_place}</span>
                </div>
              )}
              {person.occupation && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span>Occupation: {person.occupation}</span>
                </div>
              )}
            </div>
          </div>

          {/* Biography */}
          {person.biography && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Biography
              </label>
              <p className="text-sm text-foreground leading-relaxed bg-card p-3 rounded-lg border border-border whitespace-pre-line">
                {person.biography}
              </p>
            </div>
          )}

          {/* Immediate Relatives */}
          {person.relatives && (
            <div className="space-y-4 pt-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Immediate Relatives
              </label>

              {/* Parents */}
              {person.relatives.parents.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Parents:</span>
                  <div className="space-y-1">
                    {person.relatives.parents.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => onSelectPerson(p.id)}
                        className="w-full flex items-center justify-between p-2 rounded-md hover:bg-secondary border border-border text-xs text-left"
                      >
                        <span className="font-semibold text-foreground">{p.full_name}</span>
                        <span className="text-muted-foreground">{p.lifespan}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Spouses */}
              {person.relatives.spouses.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Spouse / Partner:</span>
                  <div className="space-y-1">
                    {person.relatives.spouses.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => onSelectPerson(s.id)}
                        className="w-full flex items-center justify-between p-2 rounded-md hover:bg-secondary border border-border text-xs text-left"
                      >
                        <span className="font-semibold text-foreground">{s.full_name}</span>
                        <span className="text-muted-foreground">{s.lifespan}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Children */}
              {person.relatives.children.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Children:</span>
                  <div className="space-y-1">
                    {person.relatives.children.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => onSelectPerson(c.id)}
                        className="w-full flex items-center justify-between p-2 rounded-md hover:bg-secondary border border-border text-xs text-left"
                      >
                        <span className="font-semibold text-foreground">{c.full_name}</span>
                        <span className="text-muted-foreground">{c.lifespan}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="py-12 text-center text-sm text-muted-foreground">No person selected.</div>
      )}
    </Drawer>
  );
}
