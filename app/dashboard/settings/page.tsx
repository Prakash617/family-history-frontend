"use client";

import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { User as UserIcon, Lock, Shield, CheckCircle2 } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function DashboardSettingsPage() {
  const { user, loadSession } = useAuthStore();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Profile form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Password form
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: { first_name: string; last_name: string }) =>
      apiRequest("/users/me/", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      loadSession();
      toast({ title: "Profile Updated", description: "Your details have been saved." });
    },
    onError: () => {
      toast({ title: "Update Failed", description: "Could not update profile.", type: "error" });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: { old_password: string; new_password: string }) =>
      apiRequest("/users/change-password/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: "Password Changed", description: "Your password has been successfully updated." });
    },
    onError: () => {
      toast({ title: "Password Change Failed", description: "Verify your current password.", type: "error" });
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ first_name: firstName, last_name: lastName });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords Mismatch", description: "New passwords do not match.", type: "error" });
      return;
    }
    changePasswordMutation.mutate({ old_password: oldPassword, new_password: newPassword });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-8">
          <div className="border-b border-border pb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
              Account Settings
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your personal profile, credentials, and application preferences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Information */}
            <Card className="border-border">
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-primary" />
                  Personal Information
                </CardTitle>
                <CardDescription>Update your display name and identity.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Email</label>
                    <Input disabled value={user?.email || ""} className="bg-muted cursor-not-allowed text-xs" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">First Name</label>
                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="text-xs" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Last Name</label>
                    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="text-xs" />
                  </div>

                  <Button type="submit" disabled={updateProfileMutation.isPending} className="w-full text-xs">
                    {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Security & Password */}
            <Card className="border-border">
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  Change Password
                </CardTitle>
                <CardDescription>Ensure your account uses a secure password.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Current Password</label>
                    <Input
                      type="password"
                      required
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">New Password</label>
                    <Input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Confirm New Password</label>
                    <Input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  <Button type="submit" disabled={changePasswordMutation.isPending} className="w-full text-xs">
                    {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
