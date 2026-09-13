"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, Check, KeyRound } from "lucide-react";
import { apiRequest } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function DashboardInvitationsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tokenInput, setTokenInput] = useState("");

  const acceptMutation = useMutation({
    mutationFn: (token: string) =>
      apiRequest("/invitations/accept/", {
        method: "POST",
        body: JSON.stringify({ token }),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["families"] });
      setTokenInput("");
      toast({ title: "Invitation Accepted", description: data.detail });
    },
    onError: () => {
      toast({ title: "Invalid Token", description: "This invitation is invalid or expired.", type: "error" });
    },
  });

  const handleAccept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    acceptMutation.mutate(tokenInput.trim());
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
          <div className="border-b border-border pb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
              Family Invitations
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Join a relative&apos;s family tree using an invitation token.
            </p>
          </div>

          <Card className="border-border">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-primary" />
                Redeem Invitation Token
              </CardTitle>
              <CardDescription>
                If a family admin or owner has sent you an invitation token, enter it below to join the family.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAccept} className="flex gap-3">
                <Input
                  required
                  placeholder="Paste invitation token here..."
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="text-xs"
                />
                <Button type="submit" disabled={acceptMutation.isPending} className="shrink-0 text-xs gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  {acceptMutation.isPending ? "Joining..." : "Join Family"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
