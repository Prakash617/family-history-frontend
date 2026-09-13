"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { Family } from "@/types";

export default function TreeRedirectPage() {
  const router = useRouter();

  const { data, isLoading } = useQuery<{ results: Family[] }>({
    queryKey: ["families"],
    queryFn: () => apiRequest<{ results: Family[] }>("/families/"),
  });

  useEffect(() => {
    if (data?.results && data.results.length > 0) {
      const familyId = data.results[0].id;
      router.replace(`/family/${familyId}/tree`);
    }
  }, [data, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-2">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-medium text-muted-foreground">
          {isLoading ? "लोड हुँदैछ (Loading Family Tree)..." : "खुल्दैछ (Opening Tree)..."}
        </p>
      </div>
    </div>
  );
}
