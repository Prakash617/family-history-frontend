"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { Person } from "@/types";
import { Modal } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyId: string;
  targetPerson: Person | null;
  relationType: "CHILD" | "SPOUSE" | "PARENT" | null;
}

export default function QuickAddModal({
  isOpen,
  onClose,
  familyId,
  targetPerson,
  relationType,
}: QuickAddModalProps) {
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState(targetPerson?.last_name || "");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER">("MALE");
  const [birthYearApprox, setBirthYearApprox] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [isLiving, setIsLiving] = useState(true);

  const titleMap = {
    CHILD: `Add Child to ${targetPerson?.full_name}`,
    SPOUSE: `Add Spouse / Partner to ${targetPerson?.full_name}`,
    PARENT: `Add Parent to ${targetPerson?.full_name}`,
  };

  const addRelativeMutation = useMutation({
    mutationFn: async () => {
      if (!targetPerson || !relationType) return;

      // 1. Create the new Person
      const newPerson = await apiRequest<Person>("/people/", {
        method: "POST",
        body: JSON.stringify({
          family: familyId,
          first_name: firstName,
          last_name: lastName,
          gender,
          birth_year_approx: birthYearApprox,
          birth_place: birthPlace,
          is_living: isLiving,
        }),
      });

      // 2. Create the appropriate Relationship
      if (relationType === "CHILD") {
        await apiRequest("/relationships/", {
          method: "POST",
          body: JSON.stringify({
            family: familyId,
            person_a: targetPerson.id, // Parent
            person_b: newPerson.id,    // Child
            relationship_type: "PARENT_CHILD",
            relationship_subtype: "BIOLOGICAL",
          }),
        });
      } else if (relationType === "PARENT") {
        await apiRequest("/relationships/", {
          method: "POST",
          body: JSON.stringify({
            family: familyId,
            person_a: newPerson.id,    // Parent
            person_b: targetPerson.id, // Child
            relationship_type: "PARENT_CHILD",
            relationship_subtype: "BIOLOGICAL",
          }),
        });
      } else if (relationType === "SPOUSE") {
        await apiRequest("/marriages/", {
          method: "POST",
          body: JSON.stringify({
            family: familyId,
            partner_1: targetPerson.id,
            partner_2: newPerson.id,
            partnership_type: "MARRIAGE",
            end_reason: "ONGOING",
          }),
        });
        await apiRequest("/relationships/", {
          method: "POST",
          body: JSON.stringify({
            family: familyId,
            person_a: targetPerson.id,
            person_b: newPerson.id,
            relationship_type: "SPOUSE",
          }),
        });
      }

      return newPerson;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family-tree", familyId] });
      queryClient.invalidateQueries({ queryKey: ["family-people", familyId] });
      queryClient.invalidateQueries({ queryKey: ["person-detail", targetPerson?.id] });
      onClose();
      setFirstName("");
      setBirthYearApprox("");
      setBirthPlace("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) return;
    addRelativeMutation.mutate();
  };

  if (!relationType || !targetPerson) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={titleMap[relationType]}
      description="Quickly add a family member and automatically connect the genealogical relationship."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">First Name</label>
            <Input
              required
              placeholder="e.g. Maya"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Last Name</label>
            <Input
              placeholder="e.g. Thapa"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
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
              <option value="OTHER">Other / Non-binary</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Birth Year (or Approx)</label>
            <Input
              placeholder="e.g. 1995 or circa 1920"
              value={birthYearApprox}
              onChange={(e) => setBirthYearApprox(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Birth Place</label>
          <Input
            placeholder="e.g. Kathmandu, Nepal"
            value={birthPlace}
            onChange={(e) => setBirthPlace(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="quick-is-living"
            checked={isLiving}
            onChange={(e) => setIsLiving(e.target.checked)}
            className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
          />
          <label htmlFor="quick-is-living" className="text-sm font-medium text-foreground cursor-pointer">
            Person is currently living
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={addRelativeMutation.isPending}>
            {addRelativeMutation.isPending ? "Connecting..." : "Add & Connect"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
