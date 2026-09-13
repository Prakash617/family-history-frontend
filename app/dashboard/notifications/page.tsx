"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { NotificationItem } from "@/types";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardNotificationsPage() {
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: notificationsData, isLoading } = useQuery<{ results: NotificationItem[] }>({
    queryKey: ["notifications"],
    queryFn: () => apiRequest<{ results: NotificationItem[] }>("/notifications/"),
  });

  const notifications = notificationsData?.results || [];

  const markAllMutation = useMutation({
    mutationFn: () =>
      apiRequest("/notifications/mark-all-read/", {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/notifications/${id}/read/`, {
        method: "PATCH",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
                Activity Notifications
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Stay updated on tree additions, member requests, and family activity.
              </p>
            </div>

            {notifications.some((n) => !n.is_read) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllMutation.mutate()}
                disabled={markAllMutation.isPending}
                className="gap-1.5 text-xs"
              >
                <CheckCheck className="h-4 w-4" />
                Mark All Read
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <Card className="border-dashed border-2 border-border p-12 text-center space-y-3">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="font-semibold text-lg text-foreground">No notifications</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                You are completely up to date. Recent actions will appear here.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif: any) => (
                <Card
                  key={notif.id}
                  className={`border-border transition-colors ${
                    !notif.is_read ? "bg-primary/5 border-primary/20" : ""
                  }`}
                >
                  <CardContent className="p-4 flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-foreground">{notif.title}</h4>
                        {!notif.is_read && <Badge variant="default" className="text-[10px] px-1.5 py-0">New</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{notif.message}</p>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(notif.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {notif.action_url && (
                        <Link href={notif.action_url}>
                          <Button size="sm" variant="outline" className="text-xs gap-1">
                            <span>View</span>
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </Link>
                      )}
                      {!notif.is_read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markReadMutation.mutate(notif.id)}
                          className="text-xs"
                        >
                          Dismiss
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
