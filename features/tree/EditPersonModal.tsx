"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, AlertTriangle, Shield, User } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { Person } from "@/types";
import { Modal } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

interface EditPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person | null;
  familyId: string;
  onDeleteSuccess?: (deletedId: string) => void;
}

export default function EditPersonModal({
  isOpen,
  onClose,
  person,
  familyId,
  onDeleteSuccess,
}: EditPersonModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER">("MALE");
  const [birthYearApprox, setBirthYearApprox] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [deathYearApprox, setDeathYearApprox] = useState("");
  const [deathDate, setDeathDate] = useState("");
  const [deathPlace, setDeathPlace] = useState("");
  const [isLiving, setIsLiving] = useState(true);
  const [occupation, setOccupation] = useState("");
  const [biography, setBiography] = useState("");
  const [privacy, setPrivacy] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [notes, setNotes] = useState("");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (person) {
      setFirstName(person.first_name || "");
      setMiddleName(person.middle_name || "");
      setLastName(person.last_name || "");
      setPreferredName(person.preferred_name || "");
      setGender((person.gender as any) || "MALE");
      setBirthYearApprox(person.birth_year_approx || "");
      setBirthDate(person.birth_date || "");
      setBirthPlace(person.birth_place || "");
      setDeathYearApprox(person.death_year_approx || "");
      setDeathDate(person.death_date || "");
      setDeathPlace(person.death_place || "");
      setIsLiving(person.is_living ?? true);
      setOccupation(person.occupation || "");
      setBiography(person.biography || "");
      setPrivacy((person.privacy as any) || "PUBLIC");
      setNotes(person.notes || "");
      setShowDeleteConfirm(false);
      setErrorMsg(null);
    }
  }, [person]);

  const updateMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest<Person>(`/people/${person?.id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["family-people", familyId] });
      queryClient.invalidateQueries({ queryKey: ["family-tree", familyId] });
      queryClient.invalidateQueries({ queryKey: ["person-standalone", person?.id] });
      queryClient.invalidateQueries({ queryKey: ["families"] });
      queryClient.invalidateQueries({ queryKey: ["family-dashboard", familyId] });
      toast({
        title: "Member Updated (विवरण सम्पादन भयो)",
        description: `Successfully updated ${updated.full_name}`,
        type: "success",
      });
      onClose();
    },
    onError: (err: any) => {
      setErrorMsg(err?.message || "Failed to update member.");
      toast({
        title: "Error",
        description: err?.message || "Failed to save changes.",
        type: "error",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      apiRequest(`/people/${person?.id}/`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family-people", familyId] });
      queryClient.invalidateQueries({ queryKey: ["family-tree", familyId] });
      queryClient.invalidateQueries({ queryKey: ["families"] });
      queryClient.invalidateQueries({ queryKey: ["family-dashboard", familyId] });
      toast({
        title: "Member Removed (सदस्य हटाइयो)",
        description: `${person?.full_name} has been removed from the family.`,
        type: "info",
      });
      if (person && onDeleteSuccess) {
        onDeleteSuccess(person.id);
      }
      setShowDeleteConfirm(false);
      onClose();
    },
    onError: (err: any) => {
      setErrorMsg(err?.message || "Failed to delete member.");
      toast({
        title: "Error",
        description: err?.message || "Failed to delete member.",
        type: "error",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      setErrorMsg("First name is required.");
      return;
    }

    updateMutation.mutate({
      first_name: firstName.trim(),
      middle_name: middleName.trim(),
      last_name: lastName.trim(),
      preferred_name: preferredName.trim(),
      gender,
      birth_year_approx: birthYearApprox.trim(),
      birth_date: birthDate || null,
      birth_place: birthPlace.trim(),
      death_year_approx: deathYearApprox.trim(),
      death_date: isLiving ? null : deathDate || null,
      death_place: isLiving ? "" : deathPlace.trim(),
      is_living: isLiving,
      occupation: occupation.trim(),
      biography: biography.trim(),
      privacy,
      notes: notes.trim(),
    });
  };

  if (!person) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit ${person.full_name} (सदस्य विवरण सम्पादन)`}
      description="Update biographical details, vital dates, or privacy rules."
    >
      {showDeleteConfirm ? (
        <div className="space-y-4 py-2">
          <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 space-y-2">
            <div className="flex items-center gap-2 text-destructive font-bold text-sm">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>Confirm Deletion of Member</span>
            </div>
            <p className="text-xs text-destructive/90 leading-relaxed">
              Are you sure you want to permanently delete <strong>{person.full_name}</strong>?
              This will also remove all parent, child, and spouse connections linked to this person.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              {deleteMutation.isPending ? "Deleting..." : "Permanently Delete"}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto px-1 pr-2">
          {errorMsg && (
            <div className="p-2.5 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Names */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">First Name *</label>
              <Input
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Middle Name</label>
              <Input
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                placeholder="Middle"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Last Name</label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last"
              />
            </div>
          </div>

          {/* Gender & Privacy */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none"
              >
                <option value="MALE">Male (पुरुष)</option>
                <option value="FEMALE">Female (महिला)</option>
                <option value="OTHER">Other / Non-binary</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Privacy (गोपनीयता)</label>
              <select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value as any)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none font-medium"
              >
                <option value="PUBLIC">🌐 Public (सार्वजनिक)</option>
                <option value="PRIVATE">🔒 Private (गोप्य)</option>
              </select>
            </div>
          </div>

          {/* Living Status */}
          <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-secondary/20">
            <input
              type="checkbox"
              id="edit-is-living"
              checked={isLiving}
              onChange={(e) => setIsLiving(e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
            <label htmlFor="edit-is-living" className="text-xs font-medium text-foreground cursor-pointer">
              Person is currently living (जीवित व्यक्ति)
            </label>
          </div>

          {/* Birth Details */}
          <div className="space-y-1.5 p-3 rounded-lg border border-border bg-secondary/10">
            <span className="text-xs font-semibold text-foreground">Birth Information (जन्म विवरण)</span>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground">Birth Year / Approx</label>
                <Input
                  value={birthYearApprox}
                  onChange={(e) => setBirthYearApprox(e.target.value)}
                  placeholder="e.g. 1970 or circa 1920"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground">Exact Date (Optional)</label>
                <Input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1 pt-1">
              <label className="text-[11px] text-muted-foreground">Birth Place</label>
              <Input
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                placeholder="e.g. Pokhara, Kaski, Nepal"
              />
            </div>
          </div>

          {/* Death Details (if deceased) */}
          {!isLiving && (
            <div className="space-y-1.5 p-3 rounded-lg border border-rose-200 dark:border-rose-950 bg-rose-50/40 dark:bg-rose-950/20">
              <span className="text-xs font-semibold text-rose-800 dark:text-rose-300">
                Death Information (मृत्यु विवरण)
              </span>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">Death Year / Approx</label>
                  <Input
                    value={deathYearApprox}
                    onChange={(e) => setDeathYearApprox(e.target.value)}
                    placeholder="e.g. 2015"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">Exact Date (Optional)</label>
                  <Input
                    type="date"
                    value={deathDate}
                    onChange={(e) => setDeathDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1 pt-1">
                <label className="text-[11px] text-muted-foreground">Death Place</label>
                <Input
                  value={deathPlace}
                  onChange={(e) => setDeathPlace(e.target.value)}
                  placeholder="e.g. Kathmandu, Nepal"
                />
              </div>
            </div>
          )}

          {/* Occupation */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Occupation (पेशा / व्यवसाय)</label>
            <Input
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              placeholder="e.g. Teacher, Civil Engineer, Farmer"
            />
          </div>

          {/* Biography & Notes */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Biography & Life Story (जीवनी तथा विवरण)</label>
            <textarea
              rows={3}
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              placeholder="Life summary, notable achievements, memories, historical events..."
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="gap-1.5 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Member
            </Button>

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}
