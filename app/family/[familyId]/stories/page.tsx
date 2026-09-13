"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Plus, User, Calendar, Tag } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { Story, Person } from "@/types";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Modal } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function FamilyStoriesPage() {
  const params = useParams();
  const familyId = params.familyId as string;
  const queryClient = useQueryClient();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { data: storiesData, isLoading } = useQuery<{ results: Story[] }>({
    queryKey: ["family-stories", familyId],
    queryFn: () => apiRequest<{ results: Story[] }>(`/stories/?family=${familyId}`),
  });

  const stories = storiesData?.results || [];

  const createStoryMutation = useMutation({
    mutationFn: (newStory: { title: string; content: string; family: string }) =>
      apiRequest<Story>("/stories/", {
        method: "POST",
        body: JSON.stringify(newStory),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family-stories", familyId] });
      setCreateModalOpen(false);
      setTitle("");
      setContent("");
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    createStoryMutation.mutate({
      family: familyId,
      title,
      content,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar familyId={familyId} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
                Historical Stories & Memories
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Preserve oral traditions, migration tales, and written memoirs across generations.
              </p>
            </div>

            <Button onClick={() => setCreateModalOpen(true)} className="gap-1.5 text-xs">
              <Plus className="h-4 w-4" />
              Write Story
            </Button>
          </div>

          {isLoading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">Loading stories...</div>
          ) : stories.length === 0 ? (
            <Card className="border-dashed border-2 border-border p-12 text-center space-y-3">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="font-semibold text-lg text-foreground">No stories written yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Record your first family story or oral history to preserve it for future generations.
              </p>
              <Button onClick={() => setCreateModalOpen(true)}>Write Story</Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {stories.map((story) => (
                <Card
                  key={story.id}
                  onClick={() => setSelectedStory(story)}
                  className="border-border hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                >
                  <CardHeader className="space-y-2 pb-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(story.created_at).toLocaleDateString()}</span>
                      </div>
                      <Badge variant="outline">{story.status}</Badge>
                    </div>

                    <CardTitle className="text-xl font-serif text-foreground hover:text-primary transition-colors">
                      {story.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {story.content.replace(/[#*`>]/g, "")}
                    </p>

                    {story.associated_people_details && story.associated_people_details.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border">
                        <Tag className="h-3 w-3 text-muted-foreground" />
                        {story.associated_people_details.map((p) => (
                          <span key={p.id} className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            {p.full_name}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Story Reader Modal */}
      {selectedStory && (
        <Modal
          isOpen={!!selectedStory}
          onClose={() => setSelectedStory(null)}
          title={selectedStory.title}
          description={`Preserved by ${selectedStory.author?.full_name || "Family Member"} on ${new Date(selectedStory.created_at).toLocaleDateString()}`}
        >
          <div className="prose prose-sm dark:prose-invert max-w-none py-4 whitespace-pre-line text-foreground leading-relaxed">
            {selectedStory.content}
          </div>
          <div className="flex justify-end pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setSelectedStory(null)}>
              Close
            </Button>
          </div>
        </Modal>
      )}

      {/* Write Story Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Preserve a Family Story"
        description="Write down memories, origin stories, or historical milestones."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Story Title</label>
            <Input
              required
              placeholder="e.g. Grandfather's Expedition to the Valley"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Story Content (Supports Markdown)</label>
            <textarea
              required
              rows={8}
              placeholder="Write the story here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-md border border-input bg-background p-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createStoryMutation.isPending}>
              {createStoryMutation.isPending ? "Publishing..." : "Publish Story"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
